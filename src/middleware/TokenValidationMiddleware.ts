/* Models */
import { Request } from '../model/API';
import { Database, DBSchemaUser } from '../model/DB';
import { HTTPCode } from '../model/HTTP';
import { Token } from '../model/User';

/* Application files */
import { getToken, decodeToken } from '../lib/token';
import APIError from '../controller/APIError';

export default function (DB: Database, hash: string) {
    return [ async (req: Request, res, next) => {
        req.user = {
            _id: null,
            token: null,
            role: null,
            error: null
        };

        let token: string;
        let decodedToken: Token;
        let user: DBSchemaUser;

        try {
            token = getToken(req);
            decodedToken = await decodeToken(getToken(req), hash);
            const users = await DB.get('users', {
                _id: decodedToken._id,
                sessions: {
                    $elemMatch: {
                        token: token.slice(-32)
                    }
                } }) as DBSchemaUser[];
            user = users[0];

            if (!user) {
                throw new APIError('Authentication failure: token invalid.', HTTPCode.UNAUTHORIZED);
            }

            const session = user.sessions.find((s) => s.token === token.slice(-32));

            if (session.end !== 0 && session.end < new Date().getTime()) {
                throw new APIError('Authentication failure: token has expired.', HTTPCode.UNAUTHORIZED);
            }
        } catch (error) {
            req.user.error = error;
        } finally {
            req.user.token = token;
            if (user) req.user.role = user.role;
            if (decodedToken) req.user._id = decodedToken._id;
        }

        return next();
    } ];
}
