import { registerAs } from '@nestjs/config';
import { StorageOptions } from '@notifications-system/storage-typeorm-0.2';

export const cfgDatabase: StorageOptions = require('../../ormconfig.js');

export const configDatabase = registerAs('database', () => cfgDatabase);
