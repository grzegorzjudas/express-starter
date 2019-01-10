/* Models */
import { AnyObject } from './Object';
import { UserAccessLevel } from './User';

/* Application files */
import APIError from 'controller/APIError';

export interface Database {
    error?: APIError;
    getType: () => DBType;
    isConnected: () => Promise<boolean>;
    disconnect: () => Promise<void>;
    isSetup: () => Promise<boolean>;
    setup: () => Promise<void>;
    count: (collection: string, filter?: AnyObject) => Promise<number>;
    add: (collection: string, item: any) => Promise<void>;
    get: (collection: string, filter?: AnyObject) => Promise<any>;
    update: (collection: string, what: any, filter?: AnyObject) => Promise<number>;
    remove: (collection: string, filter?: AnyObject) => Promise<void>;
}

export enum DBType {
    MONGO = 'MONGO'
}

export type DBSchema = {
    users: DBSchemaUser[];
};

export type DBSchemaUser = {
    _id?: string;
    _meta: DBSchemaUserMeta;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    password: string;
    role: UserAccessLevel;
    sessions: DBSchemaUserSession[];
};

export type DBSchemaUserMeta = {
    created: number;
    lastLogin: number;
};

export type DBSchemaUserSession = {
    _meta: DBSchemaUserSessionMeta;
    ip: string;
    start: number;
    end: number;
    token: string;
};

export type DBSchemaUserSessionMeta = {
    lastUsed: number;
};
