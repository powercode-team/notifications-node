import { DataSource, DataSourceOptions, FindOptionsWhere } from 'typeorm';

export type StorageOptions = DataSource | Partial<DataSourceOptions>;

export type FindWhere<Entity> = FindOptionsWhere<Entity>[] | FindOptionsWhere<Entity>;
