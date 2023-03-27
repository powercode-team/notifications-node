import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase, dropDatabase } from 'typeorm-extension';
import { StorageOptions, TypeOrmStorage } from '../..';

export class TypeOrmStorageTest extends TypeOrmStorage {
  async initialize(options: StorageOptions): Promise<TypeOrmStorageTest> {
    const dataSource = await this.dataSourceInstance(options);

    const dataSourceOptions = <DataSourceOptions> {
      ...dataSource.options,
      database: `${dataSource.options.database}_test_${(new Date()).getTime()}`,
      migrations: ['./node_modules/@node-notifications/storage-typeorm-0.3/**/migrations/*.js'],
      logging: false,
      synchronize: false,
    };

    await createDatabase({ ifNotExist: true, synchronize: false, options: { ...dataSourceOptions } });

    await super.initialize(dataSourceOptions);

    await this.dataSource.runMigrations();

    return this;
  }

  async destroy(delay: number = 60): Promise<void> {
    const dataSource = this.clearDataSource();
    if (!dataSource) {
      return;
    }

    if (delay > 0) {
      console.log(`Auto cleanup through ${delay} sec ...`);
      setTimeout(() => this.cleanup(dataSource), delay * 1000);
    } else {
      await this.cleanup(dataSource);
    }
  }

  protected async cleanup(dataSource: DataSource) {
    await dataSource.undoLastMigration();

    await dataSource.destroy();
    await dropDatabase({ ifExist: true, options: { ...dataSource.options } });

    console.log('Done');
  }
}
