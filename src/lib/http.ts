/* Libraries */
import { AnySchema } from 'joi';

/* Types */
import { Response } from 'express';
import { Span, Tags } from 'opentracing';
import { HTTPCode } from '../type/HTTP';

/* Application files */
import APIError from './error';
import Config from './config';

export function respondSuccess (res: Response, data: any = null, status: number = HTTPCode.OK): void {
    res.set('Content-Type', 'application/json');
    res.status(status);

    if (status !== HTTPCode.NO_CONTENT) {
        res.send(JSON.stringify({ status: 'ok', data }, null, 4));
    } else {
        res.send();
    }

    setFinalTags(status);
}

export function closeWithError (res: Response, error: APIError): void {
    res.setHeader('Content-Type', 'application/json');

    res.status(error.code);
    res.send(JSON.stringify({ status: 'error', data: { message: error.message, code: error.code } }, null, 4));

    setFinalTags(error.code, error);
}

export function validateRequestBody (body: unknown, schema: AnySchema): Promise<any> {
    const buildPath = (path: (string | number)[]) => {
        return (path.reduce((p, n) => {
            p += typeof n === 'string' ? `.${n}` : `[${n}]`;

            return p;
        }, '') as string).slice(1);
    };

    return new Promise((resolve, reject) => {
        const { error, value } = schema.validate(body, {
            convert: false,
            stripUnknown: true
        });

        if (error) {
            const msg = `Request validation failed: ${error.details[0].message} (${buildPath(error.details[0].path)})`;

            return reject(new APIError(msg, HTTPCode.BAD_REQUEST));
        }

        return resolve(value);
    });
}

function setFinalTags (status: number, error?: APIError) {
    const span: Span = Config.fromSession('Span');
    const endpoint = (Config.fromSession('Endpoint') as string).split(' ');

    if (error) {
        span.setTag(Tags.ERROR, true);
        span.setTag('Location', error.location);
    }

    span.setTag(Tags.HTTP_STATUS_CODE, status);
    span.setTag(Tags.HTTP_METHOD, endpoint[0]);
    span.setTag(Tags.HTTP_URL, endpoint[1]);
}
