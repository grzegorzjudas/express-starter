/* Libraries */
import cls from 'cls-hooked';
import uuid from 'uuid/v4';
import { globalTracer } from 'opentracing';

/* Application files */
import Config from '../controller/Config';

export default function () {
    return [ (req, res, next) => {
        const store = cls.getNamespace(Config.SESSION_NAMESPACE);
        const requestId = uuid();
        const sessionId = uuid();

        const span = globalTracer().startSpan('Request');
        span.setTag('RequestID', requestId);
        span.setTag('SessionId', sessionId);

        store.run(async () => {
            store.set('RequestID', requestId);
            store.set('SessionID', sessionId);
            store.set('Span', span);

            await next();

            span.finish();
        });
    } ];
}
