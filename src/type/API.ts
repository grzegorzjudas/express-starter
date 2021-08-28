/* Types */
import { Request, Response } from 'express';
import { AnySchema } from 'joi';
import { HTTPMethod } from './HTTP';

export type APIRoute = {
    method: HTTPMethod;
    url: string;
    schema?: AnySchema;
    controller: (req: Request, res: Response) => any;
}
