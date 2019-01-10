/* Models */
import { APIRoute, Request, Response } from 'model/API';
import { HTTPMethod } from 'model/HTTP';

/* Application files */
import { respondSuccess } from 'lib/http';
import DB from 'controller/DB';

export default {
    method: HTTPMethod.GET,
    url: '/status',
    controller: async (req: Request, res: Response) => {
        const dbConnected = await DB.isConnected();

        respondSuccess(res, {
            status: 'up',
            database: {
                type: DB.getType(),
                connected: dbConnected
            }
        });
    }
} as APIRoute;
