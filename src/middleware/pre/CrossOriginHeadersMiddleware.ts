/* Types */
import { Request, Response, NextFunction } from 'express';
import { HTTPMethod, HTTPCode } from '../../type/HTTP';

/* Application files */
import { respondSuccess } from '../../lib/http';

export default function CrossOriginHeadersMiddleware (allowed: string) {
    allowed = allowed || '*';

    return [ (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', allowed);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers') || '*');
        res.setHeader('Access-Control-Expose-Headers', 'Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        if (allowed !== '*') {
            res.setHeader('Vary', 'Origin');
        }

        if (req.method === HTTPMethod.OPTIONS) {
            return respondSuccess(res, null, HTTPCode.NO_CONTENT);
        }

        return next();
    } ];
}
