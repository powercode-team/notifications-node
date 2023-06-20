import { INotificationHistoryRepo, INotificationQueueRepo, ObjectHelper, PK } from '@node-notifications/core';
import { Connection, ConnectionOptions } from 'typeorm';
import { ObjectType } from 'typeorm/common/ObjectType';
import { StorageOptions } from './type';

export class OrmRepoFactory<Id extends PK = PK, UserId extends PK = PK> {
  protected _connection: Connection | null = null;

  constructor(
    protected readonly notificationTarget: ObjectType<INotificationHistoryRepo<Id, UserId> & INotificationQueueRepo<Id>>,
    protected readonly historyTarget: ObjectType<INotificationHistoryRepo<Id, UserId>>,
    protected readonly queueTarget: ObjectType<INotificationQueueRepo<Id>>,
  ) {}

  private _notificationRepo?: INotificationHistoryRepo<Id, UserId> & INotificationQueueRepo<Id>;
  private _historyRepo?: INotificationHistoryRepo<Id, UserId>;
  private _queueRepo?: INotificationQueueRepo<Id>;

  get connection(): Connection {
    if (!this._connection) {
      throw new Error(`Uninitialized ${ this.constructor.name }. Please call ${ this.constructor.name }::initialize()`);
    }
    return this._connection;
  }

  get notificationRepo(): INotificationHistoryRepo<Id, UserId> & INotificationQueueRepo<Id> {
    if (!this._notificationRepo) {
      throw new Error(`Uninitialized ${ this.constructor.name }. Please call ${ this.constructor.name }::initialize()`);
    }
    return this._notificationRepo;
  }

  get historyRepo(): INotificationHistoryRepo<Id, UserId> {
    if (!this._historyRepo) {
      throw new Error(`Uninitialized ${ this.constructor.name }. Please call ${ this.constructor.name }::initialize()`);
    }
    return this._historyRepo;
  }

  get queueRepo(): INotificationQueueRepo<Id> {
    if (!this._queueRepo) {
      throw new Error(`Uninitialized ${ this.constructor.name }. Please call ${ this.constructor.name }::initialize()`);
    }
    return this._queueRepo;
  }

  async initialize(options: StorageOptions): Promise<this> {
    this._connection = await this.connectionInstance(options);

    // Performs connection to the database.
    await this._connection.connect();

    this._notificationRepo = this._connection.getCustomRepository(this.notificationTarget);
    this._historyRepo = this._connection.getCustomRepository(this.historyTarget);
    this._queueRepo = this._connection.getCustomRepository(this.queueTarget);

    return this;
  }

  async destroy(): Promise<void> {
    // Clear Repositories
    this._historyRepo = undefined;
    this._queueRepo = undefined;

    return this.clearConnection()?.close();
  }

  protected connectionInstance(storageOptions: StorageOptions): Promise<Connection> {
    let connection: Connection;

    if (ObjectHelper.isObject(storageOptions, true)) {
      connection = new Connection(<ConnectionOptions> ObjectHelper.mergeDeep(
        storageOptions,
        {
          entities: [__dirname + '/entity/*.{ts,js}'],
          synchronize: false,
        },
      ));
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
