/* Types */
import { Response, Request, NextFunction } from 'express';
import { HTTPCode } from '../../type/HTTP';

/* Application files */
import APIError from '../../lib/error';
import { closeWithError } from '../../lib/http';

export default function NotFoundMiddleware () {
    return [ (req: Request, res: Response, next: NextFunction) => {
        if (!res.writableEnded) {
            closeWithError(res, new APIError('Route not found.', HTTPCode.NOT_FOUND));
        }

        next();
    } ];
}
