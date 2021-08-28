/* Libraries */
import redis, { RedisClient } from 'redis';

/* Types */
import { CacheCollection } from '../type/Cache';

/* Application files */
import Config from './config';
import APIError from './error';
import { measureDatabaseQuery } from './log';

const measureQuery = measureDatabaseQuery('redis');

export class Redis {
    private client: RedisClient;
    private onConnected: Promise<void>;
    private error: APIError = null;

    constructor (host: string, port: number, password?: string) {
        this.onConnected = new Promise<void>((resolve, reject) => {
            try {
                this.client = redis.createClient({ host, port, password });

                this.client.on('connect', () => {
                    return resolve();
                });

                this.client.on('error', (error) => {
                    return reject(new APIError(error.message));
                });
            } catch (error) {
                const { message } = error as Error;

                return reject(new APIError(message));
            }
        }).catch((error) => {
            this.error = error;
        });
    }

    async isConnected (): Promise<boolean> {
        if (this.error) return false;

        await this.onConnected;

        return true;
    }

    async set (collection: CacheCollection, key: string, value: string, ttl?: number): Promise<void> {
        return measureQuery('set', async () => {
            return new Promise((resolve, reject) => {
                this.client.set(`${collection}::${key}`, value, (error) => {
                    if (error) return reject(new APIError(error.message));
                    if (!ttl) return resolve(null);
                });

                if (ttl) {
                    this.client.pexpire(`${collection}::${key}`, ttl, (error) => {
                        if (error) return reject(new APIError(error.message));

                        return resolve(null);
                    });
                }
            });
        });
    }

    async get (collection: CacheCollection, key: string): Promise<string> {
        return measureQuery('set', async () => {
            return new Promise((resolve, reject) => {
                this.client.get(`${collection}::${key}`, (error, response) => {
                    if (error) return reject(new APIError(error.message));

                    return resolve(response);
                });
            });
        });
    }
}

export default new Redis(Config.REDIS_HOST, Config.REDIS_PORT, Config.REDIS_PASSWORD);
