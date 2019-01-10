/* Application files */
import DBMongo from 'lib/db';
import Config from './Config';
import Log from './Log';

const db = new DBMongo(Config.DB_URL, Config.DB_NAME, Config.DB_AUTH);

db.onConnected.catch((error) => {
    Log.error(`Could not connect to database: ${error.message}.`);
});

export default db;
