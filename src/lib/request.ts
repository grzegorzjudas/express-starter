/* Libraries */
import fetch from 'node-fetch';

/* Models */
import { HTTPMethod, HTTPCode } from '../model/HTTP';

/* Application files */
import APIError from '../controller/APIError';

async function request (method: HTTPMethod, url: string, data?: any, token?: string): Promise<any> {
    try {
        const response = await fetch(method, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { token } : {})
            },
            ...(data ? { data: JSON.stringify(data) } : {})
        });

        const json = await response.json();
        const headers = response.headers.raw();

        return { body: json, headers };
    } catch (error) {
        const msg = `Request to '${url}' failed: ${error.message}`;

        throw new APIError(msg, HTTPCode.BAD_GATEWAY);
    }
}

export async function GET (url: string, token?: string): Promise<any> {
    return request(HTTPMethod.GET, url, null, token);
}

export async function POST (url: string, data?: any, token?: string): Promise<any> {
    return request(HTTPMethod.POST, url, data, token);
}

export async function PUT (url: string, data?: any, token?: string): Promise<any> {
    return request(HTTPMethod.PUT, url, data, token);
}

export async function PATCH (url: string, data?: any, token?: string): Promise<any> {
    return request(HTTPMethod.PATCH, url, data, token);
}

export async function DELETE (url: string, token?: string): Promise<any> {
    return request(HTTPMethod.DELETE, url, null, token);
}
