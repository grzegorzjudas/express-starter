/* Libraries */
import express, { Request, Response, NextFunction } from 'express';
import cls from 'cls-hooked';
import { initGlobalTracer } from 'opentracing';

/* Types */
import { AddressInfo } from 'net';
import { HTTPCode } from './type/HTTP';

/* Application files */
import Process from './lib/process';
import Log, { createTracer } from './lib/log';
import Config from './lib/config';
import APIError from './lib/error';

import preMiddlewares from './middleware/pre';
import postMiddlewares from './middleware/post';
import routes from './route';
import { respondSuccess, closeWithError, validateRequestBody } from './lib/http';

Process.onStop(async () => {
    Log.info('Stopping server');
});

Process.onException(async (error) => {
    if (error) Log.error(`Fatal error: ${error.message}`);

    Log.info('Stopping server');
});

cls.createNamespace(Config.SESSION_NAMESPACE);
initGlobalTracer(createTracer(Config.APP_NAME));

if (Config.STRICT_TLS === false) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const server = express();

for (const preMiddleware of preMiddlewares) {
    server.use(...preMiddleware as any);
}

for (const route of routes) {
    server[route.method.toLowerCase()](route.url, async (req: Request, res: Response, next: NextFunction) => {
        Log.debug(`${route.method} ${route.url}`);

        try {
            if (route.schema) req.body = await validateRequestBody(req.body, route.schema);

            const response = await route.controller(req, res);

            if (typeof response !== 'undefined') respondSuccess(res, response);
        } catch (error) {
            if (error instanceof APIError) return error;

            const { message, stack } = error as Error;

            closeWithError(res, new APIError(message, HTTPCode.INTERNAL_SERVER_ERROR, true, stack));
        }

        return next();
    });
}

for (const postMiddleware of postMiddlewares) {
    server.use(...postMiddleware);
}

const instance = server.listen(Config.PORT, () => {
    const { address, port } = instance.address() as AddressInfo;

    Log.info(`Server listening on ${address}:${port}`);
}).on('error', (err) => {
    Log.fail(`Could not start server: ${err.message}`);
});
