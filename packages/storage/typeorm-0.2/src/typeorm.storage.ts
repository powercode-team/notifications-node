import { BaseStorage, PrimaryKey } from '@notifications-system/core';
import { Connection, ConnectionOptions } from 'typeorm';
import { NotificationRepository, QueueRepository } from './repository';
import { StorageOptions } from './type';

export class TypeormStorage<USER_ID extends PrimaryKey = string> extends BaseStorage<QueueRepository, NotificationRepository<USER_ID>> {
  protected _connection: Connection | null = null;

  get connection(): Connection {
    if (!this._connection) {
      throw new Error(`Uninitialized ${this.constructor.name}. Please call ${this.constructor.name}::initialize()`);
    }
    return this._connection;
  }

  async initialize(options: StorageOptions): Promise<TypeormStorage<USER_ID>> {
    this._connection = await this.connectionInstance(options);

    // Performs connection to the database.
    await this._connection.connect();

    this._queueRepo = this._connection.getCustomRepository(QueueRepository);
    this._notificationRepo = this._connection.getCustomRepository(NotificationRepository<USER_ID>);

    return this;
  }

  async destroy(): Promise<void> {
    // Clear Repositories
    this._queueRepo = null;
    this._notificationRepo = null;

    return this.clearConnection()?.close();
  }

  protected connectionInstance(storageOptions: StorageOptions): Promise<Connection> {
    let connection: Connection;

    if (storageOptions.constructor.name === 'Object') {
      connection = new Connection(<ConnectionOptions> {
        ...storageOptions,
        entities: ['./node_modules/@notifications-system/storage-typeorm-0.2/lib/**/*.entity.js'],
        synchronize: false,
      });
    } else {
      connection = <Connection> storageOptions;
    }

    return Promise.resolve(connection);
  }

  protected clearConnection(): Connection | null {
    if (!this._connection) {
      return null;
    }

    const connection = this._connection;
    this._connection = null;

    return connection;
  }
}
