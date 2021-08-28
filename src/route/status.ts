/* Types */
import { HTTPMethod } from '../type/HTTP';
import { APIRoute } from '../type/API';

export default {
    method: HTTPMethod.GET,
    url: '/status',
    controller: async () => {
        return {
            status: 'up'
        };
    }
} as APIRoute;
