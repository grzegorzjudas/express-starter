/* Models */
import { APIRoute } from 'model/API';

/* Application files */
import signin from './signin';
import signout from './signout';
import current from './current';

export default [
    signin,
    signout,
    current
] as APIRoute[];
