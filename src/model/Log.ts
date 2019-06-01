import { Span } from 'opentracing';
import { AnyObject } from './Object';

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR'
}

export enum LogColor {
    BLUE = '\x1b[34m',
    YELLOW = '\x1b[33m',
    RED = '\x1b[31m',
    DEFAULT = '\x1b[0m'
}

export type SpanOptions = {
    parent?: Span;
    target: string;
    action: string;
    tags?: AnyObject;
};
