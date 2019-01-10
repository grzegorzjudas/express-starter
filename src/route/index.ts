/* Models */
import { APIRoute } from 'model/API';

/* Application files */
import status from './status';
import user from './user';

export default [
    status,
    ...user
] as APIRoute[];
