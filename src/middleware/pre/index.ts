/* Application files */
import Config from '../../lib/config';

import RobotsStaticFileMiddleware from './RobotsStaticFileMiddleware';
import RequestDataJsonParserMiddleware from './RequestDataJsonParserMiddleware';
import SessionStorageSetupMiddleware from './SessionStorageSetupMiddleware';
import CrossOrignHeadersMiddleware from './CrossOriginHeadersMiddleware';
import CookieParserMiddleware from './CookieParserMiddleware';
import CompressionMiddleware from './CompressionMiddleware';

export default [
    RobotsStaticFileMiddleware(Config.NODE_ENV),
    RequestDataJsonParserMiddleware(),
    SessionStorageSetupMiddleware(Config.SESSION_NAMESPACE),
    CrossOrignHeadersMiddleware(Config.ALLOWED_ORIGINS),
    CookieParserMiddleware(),
    CompressionMiddleware()
];
