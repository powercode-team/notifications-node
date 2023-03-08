import { BaseStorage } from '@node-notifications/core';
import { Connection, ConnectionOptions } from 'typeorm';
import { NotificationQueueRepository, NotificationRepository } from './repository';
import { StorageOptions } from './type';

export class TypeOrmStorage extends BaseStorage<NotificationQueueRepository, NotificationRepository> {
  protected _connection: Connection | null = null;

  get connection(): Connection {
    if (!this._connection) {
      throw new Error(`Uninitialized ${this.constructor.name}. Please call ${this.constructor.name}::initialize()`);
    }
    return this._connection;
  }

  async initialize(options: StorageOptions): Promise<TypeOrmStorage> {
    this._connection = await this.connectionInstance(options);

    // Performs connection to the database.
    await this._connection.connect();

    this._queueRepo = this._connection.getCustomRepository(NotificationQueueRepository);
    this._notificationRepo = this._connection.getCustomRepository(NotificationRepository);

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
        entities: ['./node_modules/@node-notifications/storage-typeorm-0.2/**/*.entity.js'],
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
