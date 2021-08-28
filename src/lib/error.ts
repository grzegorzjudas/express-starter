/* Types */
import { Span } from 'opentracing';
import { HTTPCode } from '../type/HTTP';

/* Application files */
import Log from './log';
import Config from './config';

export default class APIError extends Error {
    public message: string;
    public code: number;
    public location: string;

    constructor (message: string, code: number = HTTPCode.INTERNAL_SERVER_ERROR, log: boolean = true, stack?: string) {
        super();

        this.message = message;
        this.code = code;
        this.location = this.getLocation();
        this.stack = stack || this.stack;

        const params = {
            Stack: this.location,
            Endpoint: Config.fromSession('Endpoint')
        };

        if (log) {
            Log[code === HTTPCode.INTERNAL_SERVER_ERROR ? 'fail' : 'error'](message, params);
            this.updateSpan();
        }
    }

    private getLocation () {
        const [ transpiled, original ] = this.stack.split(/\n/g).slice(1);

        if (original.trim().startsWith('->')) {
            return original.trim().replace('-> ', '');
        }

        return transpiled.trim().replace('at ', '');
    }

    private updateSpan () {
        const span = Config.fromSession('Span') as Span;

        if (!span) return;

        span.logEvent('error', this.message);
        span.logEvent('stacktrace', this.stack);
    }
}

export const JSErrors = [
    'EvalError',
    'InternalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError'
];
