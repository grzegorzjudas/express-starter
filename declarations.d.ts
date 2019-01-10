declare module '*.json' {
    const content: any;
    export default content;
}

declare const CONFIG: {
    NODE_ENV: string;
    PORT: number;
    STRICT_TLS: boolean;
    LOG_LEVEL: string;
}