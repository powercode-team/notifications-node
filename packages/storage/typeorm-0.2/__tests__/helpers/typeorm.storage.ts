import { Connection, ConnectionOptions } from 'typeorm';
import { createDatabase, dropDatabase } from 'typeorm-extension';
import { StorageOptions, TypeormStorage } from '../..';

export class TypeormStorageTest extends TypeormStorage {
  async initialize(options: StorageOptions): Promise<TypeormStorageTest> {
    const connection = await this.connectionInstance(options);

    const connectionOptions = <ConnectionOptions> {
      ...connection.options,
      database: `${connection.options.database}_test_${(new Date()).getTime()}`,
      migrations: ['./node_modules/@notifications-system/storage-typeorm-0.2/lib/migrations/*.js'],
      logging: false,
      synchronize: false,
    };

    await createDatabase({ ifNotExist: true }, { ...connectionOptions });

    await super.initialize(connectionOptions);

    await this.connection.runMigrations();

    return this;
  }

  async destroy(delay: number = 60): Promise<void> {
    const connection = this.clearConnection();
    if (!connection) {
      return;
    }

    if (delay > 0) {
      console.log(`Auto cleanup through ${delay} sec ...`);
      setTimeout(() => this.cleanup(connection), delay * 1000);
    } else {
      await this.cleanup(connection);
    }
  }

  protected async cleanup(connection: Connection) {
    await connection.undoLastMigration();

    await connection.close();
    await dropDatabase({ ifExist: true }, connection.options);

    console.log('Done');
  }
}
