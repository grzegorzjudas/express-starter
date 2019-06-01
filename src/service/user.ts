/* Libraries */
import bcrypt from 'bcryptjs';

/* Models */
import { DBSchemaUser, DBSchemaUserSession } from '../model/DB';

/* Application files */
import DB from '../controller/DB';
import Log from '../controller/Log';
import APIError from '../controller/APIError';

export async function encryptPassword (password: string, salt: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        bcrypt.hash(password, salt, function (error, hash) {
            if (error) {
                return reject(new APIError(`Failed to generate encrypted password: ${error.message}`));
            }

            resolve(hash);
        });
    });
}

export async function validatePassword (password: string, hash: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {

        bcrypt.compare(password, hash, (error, res) => {
            if (error) {
                return reject(new APIError(`Failed to validate the password: ${error.message}`));
            }

            resolve(res);
        });
    });
}

export async function findUserByEmail (email: string): Promise<DBSchemaUser> {
    const users = await DB.get('users', {
        email
    }) as DBSchemaUser[];

    if (users.length > 1) {
        Log.warn(`Found two users with email '${email}', which means there's a data inconsistency.`);
    }

    return users[0];
}

export async function findUserById (_id: string): Promise<DBSchemaUser> {
    const users = await DB.get('users', {
        _id
    }) as DBSchemaUser[];

    return users[0];
}

export function cleanUserObject (user: DBSchemaUser) {
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role
    };
}

export function createSessionObject (token: string, ip: string): DBSchemaUserSession {
    return {
        _meta: {
            lastUsed: new Date().getTime()
        },
        ip,
        start: new Date().getTime(),
        end: 0,
        token: token.slice(-32)
    };
}

export async function addSessionToUser (userId: string, session: DBSchemaUserSession): Promise<number> {
    return DB.updateRaw('users', {
        $push: {
            sessions: session
        },
        $set: {
            '_meta.lastLogin': new Date().getTime()
        }
    }, {
        _id: userId
    });
}

export async function removeSessionFromUser (userId: string, token: string): Promise<number> {
    return DB.updateRaw('users', {
        $pull: {
            sessions: {
                token: token.slice(-32)
            }
        }
    });
}
