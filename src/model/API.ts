/* Models */
import { Request as ExpressRequest, Response as ExpressResponse } from 'express-serve-static-core';
import { SchemaLike } from '@hapi/joi';
import { HTTPMethod } from './HTTP';
import { UserAccessLevel } from './User';
import { AnyObject } from './Object';

/* Application files */
import APIError from '../controller/APIError';

export type APIRoute = {
    method: HTTPMethod;
    url: string;
    schema?: SchemaLike;
    protected?: UserAccessLevel;
    controller: Function;
};

export type RestResponse = {
    body: any;
    headers: AnyObject;
};

export interface Request extends ExpressRequest {
    authentication?: {
        username: string;
        password: string;
    };
    user: {
        _id: string;
        token: string;
        role: UserAccessLevel;
        error: APIError;
    };
}

export interface Response extends ExpressResponse {
}
