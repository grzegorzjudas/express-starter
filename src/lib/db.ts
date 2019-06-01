/* Libraries */
import { MongoClient, Db, Collection, ObjectID } from 'mongodb';

/* Models */
import { Database, DBType } from '../model/DB';
import { AnyObject } from '../model/Object';

/* Application files */
import APIError from '../controller/APIError';
import Log from '../controller/Log';
import dbSchema from '../db/schema/mongo.json';

export default class DBMongo implements Database {
    public db: Db = null;
    public client: MongoClient = null;
    public error: APIError = null;
    public onConnected: Promise<void>;

    constructor (url: string, database: string, auth?: string[] | null) {
        this.onConnected = new Promise<void>(async (resolve, reject) => {
            try {
                const credentials = auth ? `${auth[0]}:${auth[1]}@` : '';
                this.client = await MongoClient.connect(`mongodb://${credentials}${url}/admin`, {
                    useNewUrlParser: true
                });
                this.db = this.client.db(database);

                const isSetup = await this.isSetup();
                if (!isSetup) {
                    Log.info(`Database named '${database}' does not exist, setting up...`);
                    await this.setup();
                    Log.info(`Database '${database}' set up correctly.`);
                }

                return resolve();
            } catch (error) {
                if (!(error instanceof APIError)) reject(new APIError(error.message));

                reject(error);
            }
        }).catch((error) => {
            this.error = error;

            throw error;
        });
    }

    public getType (): DBType {
        return DBType.MONGO;
    }

    public async isConnected (): Promise<boolean> {
        if (!this.db && this.error) return false;

        return this.onConnected.then(() => true);
    }

    public async disconnect (): Promise<void> {
        if (!this.db) return;

        return this.client.close();
    }

    public async isSetup (): Promise<boolean> {
        const collections: Collection<AnyObject>[] = await this.db.collections();
        const collectionNames = collections.map((col: Collection<AnyObject>) => col.collectionName);

        return Object.keys(dbSchema).every((col) => collectionNames.includes(col));
    }

    public async setup (): Promise<void> {
        const collections: Collection<AnyObject>[] = await this.db.collections();
        const schemaCollectionNames = Object.keys(dbSchema);

        if (schemaCollectionNames.some((col) => !Array.isArray(dbSchema[col]))) {
            throw new APIError('Invalid database schema. All collections must be arrays.');
        }

        for (let collectionName of Object.keys(dbSchema)) {
            if (!collections.find((col) => col.collectionName === collectionName)) {
                await this.db.createCollection(collectionName);

                if (dbSchema[collectionName].length > 0) {
                    await this.db.collection(collectionName).insertMany(dbSchema[collectionName]);
                }
            }
        }
    }

    public async count (collection: string, filter: AnyObject = {}): Promise<number> {
        if (!this.db) await this.isConnected();

        return this.db.collection(collection).find(filter).count();
    }

    public async add (collection: string, item: AnyObject | AnyObject[]): Promise<void> {
        if (!this.db) await this.isConnected();

        if (item === null) {
            throw new APIError('Database addition failed: cannot add null as an item.');
        }

        const dbCollection = this.db.collection(collection);

        if (Array.isArray(item)) await dbCollection.insertMany(item);
        else await dbCollection.insertOne(item);
    }

    public async get (collection: string, filter: AnyObject = {}): Promise<AnyObject[]> {
        if (!this.db) await this.isConnected();
        if (filter._id) filter._id = new ObjectID(filter._id);

        return await this.db.collection(collection).find(filter).toArray() as AnyObject[];
    }

    public async update (collection: string, item: AnyObject, filter: AnyObject = {}): Promise<number> {
        if (!this.db) await this.isConnected();
        if (filter._id) filter._id = new ObjectID(filter._id);

        if (item === null) {
            throw new APIError('Database update failed: cannot use null as an item.');
        }

        const res = await this.db.collection(collection).updateMany(filter, {
            $set: item
        }, { upsert: true });

        return res.result.nModified;
    }

    public async updateRaw (collection: string, query: AnyObject, filter: AnyObject = {}): Promise<number> {
        if (!this.db) await this.isConnected();
        if (filter._id) filter._id = new ObjectID(filter._id);

        const res = await this.db.collection(collection).updateMany(filter, query);

        return res.result.nModified;
    }

    public async remove (collection: string, filter: AnyObject = {}): Promise<void> {
        if (!this.db) await this.isConnected();
        if (filter._id) filter._id = new ObjectID(filter._id);

        await this.db.collection(collection).deleteMany(filter);
    }
}
