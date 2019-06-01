/* Libraries */
import cls from 'cls-hooked';

/* Models */
import { LogLevel } from '../model/Log';

function getMostRelevantConfigProp (prop: string) {
    if (typeof process.env[prop] !== 'undefined') {
        return process.env[prop];
    }

    return null;
}

function getConfigString (prop: string): string {
    prop = getMostRelevantConfigProp(prop);

    return prop ? `${prop}` : null;
}

function getConfigNumber (prop: string): number {
    prop = getMostRelevantConfigProp(prop);

    return prop ? ~~`${prop}` : null;
}

function getConfigBoolean (prop: string): boolean {
    prop = getMostRelevantConfigProp(prop);

    return prop ? prop === 'true' : null;
}

function getConfigAuth (prop: string): string[] {
    prop = getMostRelevantConfigProp(prop);

    return prop ? Buffer.from(prop, 'base64').toString().split(':') : null;
}

export function getConfig (prop: string, type: string): any {
    switch (type) {
        case 'string': return getConfigString(prop);
        case 'number': return getConfigNumber(prop);
        case 'boolean': return getConfigBoolean(prop);
        case 'auth': return getConfigAuth(prop);
        default: return getConfigString(prop);
    }
}

export default class Config {
    public static APP_NAME: string = getConfig('APP_NAME', 'string');
    public static NODE_ENV: string = getConfig('NODE_ENV', 'string');
    public static PORT: number = getConfig('PORT', 'number');
    public static STRICT_TLS: boolean = getConfig('STRICT_TLS', 'boolean');
    public static LOG_LEVEL: LogLevel = getConfig('LOG_LEVEL', 'string') as LogLevel;
    public static SESSION_NAMESPACE: string = getConfig('SESSION_NAMESPACE', 'string');
    public static DB_URL: string = getConfig('DB_URL', 'string');
    public static DB_NAME: string = getConfig('DB_NAME', 'string');
    public static DB_AUTH: string[] = getConfig('DB_AUTH', 'auth');
    public static USER_AUTH_HASH: string = getConfig('USER_AUTH_HASH', 'string');
    public static EXPOSE_DOCS: boolean = getConfig('EXPOSE_DOCS', 'boolean');

    public static fromSession (name: string) {
        return cls.getNamespace(Config.SESSION_NAMESPACE).get(name);
    }
}
