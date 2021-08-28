/* Libraries */
import knex from 'knex';
import { knexSnakeCaseMappers } from 'objection';

/* Application files */
import Config from '../lib/config';
import { measureDatabaseQuery } from '../lib/log';

export const measureQuery = measureDatabaseQuery('postgresql');

export default knex({
    client: 'pg',
    connection: {
        host: Config.DB_HOST,
        port: Config.DB_PORT,
        user: Config.DB_USER,
        password: Config.DB_PASSWORD,
        database: Config.DB_DATABASE
    },
    ...knexSnakeCaseMappers()
});
