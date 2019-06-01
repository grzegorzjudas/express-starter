/* Models */
import { APIRoute, Request, Response } from '../../model/API';
import { HTTPMethod } from '../../model/HTTP';
import { UserAccessLevel } from '../../model/User';

/* Application files */
import { respondSuccess } from '../../lib/http';
import { findUserById, cleanUserObject } from '../../service/user';

export default {
    method: HTTPMethod.GET,
    url: '/user',
    protected: UserAccessLevel.USER,
    controller: async (req: Request, res: Response) => {
        const user = await findUserById(req.user._id);

        return respondSuccess(res, cleanUserObject(user));
    }
} as APIRoute;
