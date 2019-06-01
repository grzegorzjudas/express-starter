/* Models */
import { APIRoute, Request, Response } from '../../model/API';
import { HTTPMethod } from '../../model/HTTP';
import { UserAccessLevel } from '../../model/User';

/* Application files */
import { respondSuccess } from '../../lib/http';
import { removeSessionFromUser } from '../../service/user';

export default {
    method: HTTPMethod.POST,
    url: '/user/signout',
    protected: UserAccessLevel.USER,
    controller: async (req: Request, res: Response) => {
        await removeSessionFromUser(req.user._id, req.user.token);

        return respondSuccess(res, {});
    }
} as APIRoute;
