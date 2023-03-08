import { BaseStorage } from '@node-notifications/core';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { NotificationEntity, NotificationQueueEntity } from './entity';
import { NotificationQueueRepository, NotificationRepository } from './repository';
import { StorageOptions } from './type';

export class TypeOrmStorage extends BaseStorage<NotificationQueueRepository, NotificationRepository> {
  protected _dataSource: DataSource | null = null;

  get dataSource() {
    if (!this._dataSource) {
      throw new Error(`Uninitialized ${this.constructor.name}. Please call ${this.constructor.name}::initialize()`);
    }
    return this._dataSource;
  }

  async initialize(options: StorageOptions): Promise<TypeOrmStorage> {
    this._dataSource = await this.dataSourceInstance(options);

    // Performs connection to the database.
    await this.dataSource.initialize();

    // Init Repositories
    this._queueRepo = new NotificationQueueRepository(NotificationQueueEntity, this.dataSource.manager);
    this._notificationRepo = new NotificationRepository(NotificationEntity, this.dataSource.manager);

    return this;
  }

  async destroy(): Promise<void> {
    // Clear Repositories
    this._queueRepo = null;
    this._notificationRepo = null;

    return this.clearDataSource()?.destroy();
  }

  protected dataSourceInstance(storageOptions: StorageOptions): Promise<DataSource> {
    let dataSource: DataSource;

    if (storageOptions.constructor.name === 'Object') {
      dataSource = new DataSource(<DataSourceOptions> {
        ...storageOptions,
        entities: ['./node_modules/@node-notifications/storage-typeorm-0.3/**/*.entity.js'],
        synchronize: false,
      });
    } else {
      dataSource = <DataSource> storageOptions;
    }

    return Promise.resolve(dataSource);
  }

  protected clearDataSource(): DataSource | null {
    if (!this._dataSource) {
      return null;
    }

    const dataSource = this._dataSource;
    this._dataSource = null;

    return dataSource;
  }
}
