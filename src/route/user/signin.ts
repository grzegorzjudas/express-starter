/* Models */
import { APIRoute, Request, Response } from '../../model/API';
import { HTTPMethod, HTTPCode } from '../../model/HTTP';

/* Application files */
import APIError from '../../controller/APIError';
import Config from '../../controller/Config';
import Log from '../../controller/Log';
import { respondSuccess, getRequestOriginIP } from '../../lib/http';
import { createToken } from '../../lib/token';
import {
    findUserByEmail,
    validatePassword,
    createSessionObject,
    addSessionToUser,
    findUserById,
    cleanUserObject
} from '../../service/user';

export default {
    method: HTTPMethod.POST,
    url: '/user/signin',
    controller: async (req: Request, res: Response) => {
        if (!req.authentication && !req.user._id) {
            throw new APIError('Missing \'Authorization\' or \'Token\' header.', HTTPCode.BAD_REQUEST);
        }

        if (req.user.token) {
            const user = await findUserById(req.user._id);

            if (!user) {
                const msg = `No user with id '${req.user._id}, but id has been valided by middleware.`;
                Log.warn(`${msg} This should not happen.`);

                throw new APIError('Invalid token.', HTTPCode.UNAUTHORIZED);
            }

            return respondSuccess(res, user);
        }

        const user = await findUserByEmail(req.authentication.username);

        if (!user) throw new APIError('Invalid email or password.', HTTPCode.UNAUTHORIZED);

        const passwordOk = await validatePassword(req.authentication.password, user.password);
        if (!passwordOk) throw new APIError('Invalid email or password.', HTTPCode.UNAUTHORIZED);

        const token = await createToken(user._id, Config.USER_AUTH_HASH);
        const session = createSessionObject(token, getRequestOriginIP(req));
        await addSessionToUser(user._id, session);

        res.setHeader('Token', token);
        return respondSuccess(res, cleanUserObject(user));
    }
} as APIRoute;
