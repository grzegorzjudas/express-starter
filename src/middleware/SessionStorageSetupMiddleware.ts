/* Libraries */
import cls from 'cls-hooked';
import uuid from 'uuid/v4';

/* Application files */
import Config from 'controller/Config';

export default function () {
    return [ (req, res, next) => {
        const store = cls.getNamespace(Config.SESSION_NAMESPACE);

        store.run(() => {
            store.set('RequestID', uuid());
            store.set('SessionID', uuid());

            return next();
        });
    } ];
}
