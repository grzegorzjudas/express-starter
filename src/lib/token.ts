/* Libraries */
import jwt from 'jsonwebtoken';

/* Models */
import { HTTPCode } from 'model/HTTP';
import { Token } from 'model/User';

/* Application files */
import APIError from 'controller/APIError';

export async function createToken (id: string, hash: string): Promise<string> {
    return jwt.sign({ _id: id }, hash);
}

export async function decodeToken (token: string, hash: string): Promise<Token> {
    return new Promise<Token>((resolve, reject) => {
        jwt.verify(token, hash, (error, decoded) => {
            if (error) {
                let err = new APIError('Authentication failure: token invalid.', HTTPCode.UNAUTHORIZED);

                if (error.name === 'TokenExpiredError') {
                    err.message = 'Authentication failure: token has expired.';
                }

                return reject(err);
            }

            return resolve(decoded as Token);
        });
    });
}

export async function recreateToken (token: string, hash: string): Promise<string> {
    const decoded = await decodeToken(token, hash);

    return jwt.sign({ _id: decoded._id }, hash);
}

export function getToken (req) {
    const token = req.headers.token;

    if (!token) throw new APIError('Authentication failure: missing token.', HTTPCode.UNAUTHORIZED);

    return token;
}
