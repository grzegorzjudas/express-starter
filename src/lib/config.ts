/* Libraries */
import cls from 'cls-hooked';

/* Types */
import { LogLevel } from '../type/Log';

function getConfigString (prop: string): string {
    const val = process.env[prop] || null;

    return val ? `${val}` : val;
}

function getConfigNumber (prop: string): number {
    const val = process.env[prop] || null;

    return val ? ~~`${val}` : null;
}

function getConfigBoolean (prop: string): boolean {
    const val = process.env[prop] || null;

    return val ? val === 'true' : null;
}

function getConfig (prop: string, type: 'string' | 'number' | 'boolean'): string | number | boolean {
    switch (type) {
        case 'string': return getConfigString(prop);
        case 'number': return getConfigNumber(prop);
        case 'boolean': return getConfigBoolean(prop);
        default: return getConfigString(prop);
    }
}

export default class Config {
    public static NODE_ENV: string = getConfig('NODE_ENV', 'string') as string;
    public static APP_NAME: string = getConfig('APP_NAME', 'string') as string;
    public static APP_URL: string = getConfig('APP_URL', 'string') as string;
    public static PORT: number = getConfig('PORT', 'number') as number;
    public static STRICT_TLS: boolean = getConfig('STRICT_TLS', 'boolean') as boolean;
    public static LOG_LEVEL: LogLevel = getConfig('LOG_LEVEL', 'string') as LogLevel;
    public static LOG_DISABLE_COLORS: boolean = getConfig('LOG_DISABLE_COLORS', 'boolean') as boolean;
    public static SESSION_NAMESPACE: string = getConfig('SESSION_NAMESPACE', 'string') as string;
    public static ALLOWED_ORIGINS: string = getConfig('ALLOWED_ORIGINS', 'string') as string;
    public static DB_HOST: string = getConfig('DB_HOST', 'string') as string;
    public static DB_PORT: number = getConfig('DB_PORT', 'number') as number;
    public static DB_USER: string = getConfig('DB_USER', 'string') as string;
    public static DB_PASSWORD: string = getConfig('DB_PASSWORD', 'string') as string;
    public static DB_DATABASE: string = getConfig('DB_DATABASE', 'string') as string;
    public static REDIS_HOST: string = getConfig('REDIS_HOST', 'string') as string;
    public static REDIS_PORT: number = getConfig('REDIS_PORT', 'number') as number;
    public static REDIS_PASSWORD: string = getConfig('REDIS_PASSWORD', 'string') as string || '';
    public static JAEGER_AGENT_HOST: string = getConfig('JAEGER_AGENT_HOST', 'string') as string;
    public static JAEGER_SAMPLER_TYPE: string = getConfig('JAEGER_SAMPLER_TYPE', 'string') as string;
    public static JAEGER_SAMPLER_PARAM: number = getConfig('JAEGER_SAMPLER_PARAM', 'number') as number;

    public static fromSession (name: string) {
        return cls.getNamespace(Config.SESSION_NAMESPACE).get(name);
    }

    public static toSession (name: string, value: any) {
        return cls.getNamespace(Config.SESSION_NAMESPACE).set(name, value);
    }
}
