/* Libraries */
import fetch, { RequestInit, Response } from 'node-fetch';
import { globalTracer, Tags } from 'opentracing';

/* Models */
import { HTTPMethod, HTTPCode } from '../model/HTTP';
import { SpanOptions } from '../model/Log';
import { RestResponse } from '../model/API';

/* Application files */
import APIError from '../controller/APIError';
import Config from '../controller/Config';

async function request (method: HTTPMethod, url: string, span: SpanOptions, opts?: RequestInit): Promise<RestResponse> {
    const reqSpan = globalTracer().startSpan(span.action, {
        childOf: span.parent
    });

    reqSpan.setTag(Tags.COMPONENT, span.target);
    reqSpan.setTag(Tags.HTTP_METHOD, method);
    reqSpan.setTag(Tags.PEER_ADDRESS, url);

    if (span.tags) {
        Object.entries(span.tags).forEach(([ tag, value ]) => {
            reqSpan.setTag(tag, value);
        });
    }

    let response: Response;
    let body: string;

    try {
        response = await fetch(url, {
            ...opts,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(opts.headers || {})
            }
        });

        body = await response.text();
        const headers = response.headers.raw();

        return { body: JSON.parse(body), headers };
    } catch (error) {
        const msg = `Request to '${url}' failed: ${error.message}`;

        reqSpan.setTag(Tags.ERROR, true);
        reqSpan.logEvent(error.name, msg);
        reqSpan.log({
            body: body.split(/\n/g)[0].slice(0, 100)
        });

        throw new APIError(msg, HTTPCode.BAD_GATEWAY);
    } finally {
        if (response) {
            reqSpan.setTag(Tags.HTTP_STATUS_CODE, response.status);
        }

        reqSpan.finish();
    }
}

export async function GET (url: string, span: SpanOptions): Promise<RestResponse> {
    if (!span.parent) span.parent = Config.fromSession('Span');

    return request(HTTPMethod.GET, url, span, {});
}

export async function POST (url: string, span: SpanOptions, data?: any): Promise<RestResponse> {
    if (!span.parent) span.parent = Config.fromSession('Span');

    return request(HTTPMethod.POST, url, span, {
        ...(data ? { body: JSON.stringify(data) } : {})
    });
}

export async function PUT (url: string, span: SpanOptions, data?: any): Promise<RestResponse> {
    if (!span.parent) span.parent = Config.fromSession('Span');

    return request(HTTPMethod.PUT, url, span, {
        ...(data ? { body: JSON.stringify(data) } : {})
    });
}

export async function PATCH (url: string, span: SpanOptions, data?: any): Promise<RestResponse> {
    if (!span.parent) span.parent = Config.fromSession('Span');

    return request(HTTPMethod.PATCH, url, span, {
        ...(data ? { body: JSON.stringify(data) } : {})
    });
}

export async function DELETE (url: string, span: SpanOptions): Promise<RestResponse> {
    if (!span.parent) span.parent = Config.fromSession('Span');

    return request(HTTPMethod.DELETE, url, span, {});
}
