import { registerAs } from '@nestjs/config';
import { StorageOptions } from '@node-notifications/storage-typeorm-0.2';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const cfgDatabase: StorageOptions = require('../../ormconfig.js');

export const configDatabase = registerAs('database', () => cfgDatabase);
