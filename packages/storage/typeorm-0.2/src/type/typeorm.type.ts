import { Connection, ConnectionOptions } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { FindConditions } from 'typeorm/find-options/FindConditions';

export type StorageOptions = Connection | Partial<ConnectionOptions>;

export type FindWhere<Entity> = FindConditions<Entity> | ObjectLiteral;
