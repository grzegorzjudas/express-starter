/* Libraries */
import HTTPCode from 'http-status-codes';
import fetch, { RequestInit, Headers, BodyInit } from 'node-fetch';

/* Application files */
import APIError from './error';

export type RequestResult<T> = {
    status: number;
    headers: Record<string, string>;
    body: T;
}

function headersToRawObject (headers: Headers): Record<string, string> {
    return Object
        .entries(headers.raw())
        .reduce((acc, [ key, value ]) => {
            acc[key] = value[0];

            return acc;
        }, {});
}

export default async function request<T> (method: string, path: string, body?: unknown, opts?: RequestInit): Promise<RequestResult<T>> {
    const url = path;
    const headers = {};

    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
        method,
        headers: {
            ...headers,
            ...(opts.headers || {})
        },
        ...(body ? { body: typeof body === 'object' ? JSON.stringify(body) : body as BodyInit } : {}),
        ...opts
    });

    let errorMessage = '';
    let content;

    if (response.status >= 400) {
        errorMessage += `Request failure: ${response.status} ${response.statusText}. `;
    }

    try {
        const type = response.headers.get('Content-Type');

        content = await response.text();

        if (response.status !== HTTPCode.NO_CONTENT) {
            if (type.includes('application/json') || type.includes('text/json')) {
                content = JSON.parse(content);
            }
        } else {
            content = '';
        }
    } catch (error) {
        errorMessage += `Failed to parse response JSON: ${content}`;
    }

    if (errorMessage) {
        throw new APIError(errorMessage, response.status);
    }

    return {
        status: response.status,
        headers: headersToRawObject(response.headers),
        body: content
    };
}
