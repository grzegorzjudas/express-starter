/* Libraries */
import express from 'express';

/* Models */
import { AddressInfo } from 'net';
import { Request, Response } from 'model/API';
import { HTTPCode } from 'model/HTTP';

/* Application files */
import routes from './route';
import middlewares from './middleware';
import APIError from 'controller/APIError';
import Config from 'controller/Config';
import Log, { JSErrors } from 'controller/Log';
import { closeWithError } from 'lib/http';
import Process from 'lib/process';

Process.onStop(async () => {
    Log.info('Stopping server');
});

Process.onException(async (error) => {
    if (error) Log.error(`Fatal error: ${error.message}`);

    Log.info('Stopping server');
});

if (Config.STRICT_TLS === false) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const server = express();

for (let middleware of middlewares) {
    server.use(...middleware);
}

for (let route of routes) {
    server[route.method.toLowerCase()](route.url, async (req: Request, res: Response) => {
        Log.info(`${route.method} ${route.url}`);

        if (typeof route.protected === 'number' && (req.user.error || !req.user.token || req.user.role < route.protected)) {
            return closeWithError(res, new APIError('Authentication failure: you do not have access to this resource.', HTTPCode.FORBIDDEN));
        }

        try {
            await route.controller(req, res);
        } catch (error) {
            if (JSErrors.includes(error.name) || error.code === HTTPCode.INTERNAL_SERVER_ERROR) {
                Log.error(error.message);

                return closeWithError(res, new APIError('There has been a technical error.'));
            }

            return closeWithError(res, error);
        }
    });
}

server.use((req, res, next) => {
    return closeWithError(res, new APIError('Route not found.', HTTPCode.NOT_FOUND));
});

const instance = server.listen(Config.PORT, () => {
    const { address, port } = instance.address() as AddressInfo;

    Log.info(`Server listening on ${address}:${port}`);
}).on('error', (err) => {
    Log.error(`Could not start server: ${err.message}`);
});
