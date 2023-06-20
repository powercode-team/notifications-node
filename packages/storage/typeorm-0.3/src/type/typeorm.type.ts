import { DataSource, DataSourceOptions } from 'typeorm';

export type StorageOptions = DataSource | Partial<DataSourceOptions>;
