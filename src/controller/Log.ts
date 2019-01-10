/* Application files */
import createLogger from 'lib/log';
import Config from './Config';

export default createLogger(Config.LOG_LEVEL);
export { JSErrors } from 'lib/log';
