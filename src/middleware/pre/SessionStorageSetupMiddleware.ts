/* Libraries */
import cls from 'cls-hooked';
import { v4 as uuid } from 'uuid';
import { globalTracer } from 'opentracing';

/* Types */
import { Request, Response, NextFunction } from 'express';

export default function SessionStorageSetupMiddleware (namespace: string) {
    return [ (req: Request, res: Response, next: NextFunction) => {
        const store = cls.getNamespace(namespace);
        const requestId = uuid();
        const sessionId = uuid();
        const span = globalTracer().startSpan(`${req.method} ${req.url}`);
        const languageHeader = (req.header('Accept-Language') || 'pl').toLowerCase();
        const language = languageHeader.charAt(0).toUpperCase() + languageHeader.slice(1);

        span.setTag('request.id', requestId);
        span.setTag('session.id', sessionId);

        span.logEvent('body', JSON.stringify(req.body, null, 4));
        span.logEvent('headers', req.headers);

        res.on('finish', () => {
            span.finish();
        });

        store.run(async () => {
            store.set('RequestID', requestId);
            store.set('SessionID', sessionId);
            store.set('Span', span);
            store.set('Endpoint', `${req.method} ${req.url}`);
            store.set('Language', language);

            next();
        });
    } ];
}
