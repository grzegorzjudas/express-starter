/* Application files */
import DB from '../controller/DB';
import Config from '../controller/Config';

import CrossOriginHeadersMiddleware from './CrossOriginHeadersMiddleware';
import RequestDataJsonParserMiddleware from './RequestDataJsonParserMiddleware';
import BasicAuthenticationMiddleware from './BasicAuthenticationMiddleware';
import DocumentationOnRootMiddleware from './DocumentationOnRootMiddleware';
import SessionStorageSetupMiddleware from './SessionStorageSetupMiddleware';
import TokenValidationMiddleware from './TokenValidationMiddleware';

export default [
    SessionStorageSetupMiddleware(),
    CrossOriginHeadersMiddleware(),
    RequestDataJsonParserMiddleware(),
    BasicAuthenticationMiddleware(),
    Config.EXPOSE_DOCS && DocumentationOnRootMiddleware(),
    TokenValidationMiddleware(DB, Config.USER_AUTH_HASH)
];
