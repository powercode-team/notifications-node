import { Connection, ConnectionOptions } from 'typeorm';

export type StorageOptions = Connection | Partial<ConnectionOptions>;
