/* Libraries */
import os from 'os';
import { globalTracer, Tags, Span, FORMAT_HTTP_HEADERS } from 'opentracing';
import { initTracerFromEnv, JaegerTracer } from 'jaeger-client';

/* Types */
import { LogLevel, LogColor, LogParams, Logger, MeasureCallback } from '../type/Log';

/* Application files */
import Config from './config';
import APIError from './error';

const order = [ LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARNING, LogLevel.ERROR, LogLevel.FAILURE ];

function getFullFields () {
    function objectFromSession (name: string): Record<string, any> {
        return Config.fromSession ? { [name]: Config.fromSession(name) } : {};
    }

    return {
        ...objectFromSession('RequestID'),
        ...objectFromSession('SessionID'),
        HostName: os.hostname(),
        Application: Config.APP_NAME,
        Environment: Config.NODE_ENV
    };
}

function colorize (level: LogLevel, func: (...data: any[]) => void) {
    return (msg: string) => {
        return func([ mapLevelToColor(level), msg, LogColor.DEFAULT ].join(''));
    };
}

function mapLevelToLogger (level: LogLevel): (...data: any[]) => void {
    switch (level) {
        case LogLevel.DEBUG: return console.debug;
        case LogLevel.INFO: return console.info;
        case LogLevel.WARNING: return console.warn;
        case LogLevel.ERROR: return console.error;
        case LogLevel.FAILURE: return console.error;
        default: return console.log;
    }
}

function mapLevelToColor (level: LogLevel): LogColor {
    switch (level) {
        case LogLevel.DEBUG: return LogColor.DEFAULT;
        case LogLevel.INFO: return LogColor.BLUE;
        case LogLevel.WARNING: return LogColor.YELLOW;
        case LogLevel.ERROR: return LogColor.ORANGE;
        case LogLevel.FAILURE: return LogColor.RED;
        default: return LogColor.DEFAULT;
    }
}

function attachFieldsToMessage (fields: LogParams, msg: string): string {
    return Object.entries(fields).reduce((msg, [ key, value ]) => `[${key}=${value}] ${msg}`, msg);
}

export function createTracer (serviceName: string): JaegerTracer {
    return initTracerFromEnv({
        serviceName
    }, {});
}

export function createLogger (minimum: LogLevel): Logger {
    function log (level: LogLevel, msg: string, fields: LogParams) {
        if (order.indexOf(level) < order.indexOf(minimum)) return;

        const offset = (new Date()).getTimezoneOffset() * 60 * 1000;
        const time = (new Date(Date.now() - offset)).toISOString().slice(0, -1);

        msg = attachFieldsToMessage({
            ...fields,
            ...(Config.NODE_ENV === 'production' ? getFullFields() : {}),
            ...(Config.NODE_ENV === 'production' ? { LogLevel: level } : {})
        }, msg);
        msg = `${time} ${msg}`;

        if (Config.LOG_DISABLE_COLORS) return mapLevelToLogger(level)(msg);
        return colorize(level, mapLevelToLogger(level))(msg);
    }

    return {
        debug: (msg: string, fields: LogParams = {}) => log(LogLevel.DEBUG, msg, fields),
        info: (msg: string, fields: LogParams = {}) => log(LogLevel.INFO, msg, fields),
        warn: (msg: string, fields: LogParams = {}) => log(LogLevel.WARNING, msg, fields),
        error: (msg: string, fields: LogParams = {}) => log(LogLevel.ERROR, msg, fields),
        fail: (msg: string, fields: LogParams = {}) => log(LogLevel.FAILURE, msg, fields)
    };
}

export function measureDatabaseQuery (database: string) {
    return async <T>(action: string, callback: MeasureCallback<T>, parent?: Span): Promise<T> => {
        const tracer = createTracer(database);
        const headers = {};

        globalTracer().inject(parent || Config.fromSession('Span'), FORMAT_HTTP_HEADERS, headers);

        const context = tracer.extract(FORMAT_HTTP_HEADERS, headers);
        const span = tracer.startSpan(action, { childOf: context });

        span.setTag(Tags.COMPONENT, 'DATABASE');

        return callback(span).then((data) => {
            span.finish();

            return data;
        }).catch((error) => {
            span.logEvent('error', error.message);
            span.setTag(Tags.ERROR, true);
            span.finish();

            if (error instanceof APIError) throw error;
            else throw new APIError(error.message);
        });
    };
}

export default createLogger(Config.LOG_LEVEL);
