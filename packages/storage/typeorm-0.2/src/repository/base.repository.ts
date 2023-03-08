import { INotificationBaseRepository, IOptions, PartialRequired } from '@node-notifications/core';
import { FindManyOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotificationBaseEntity } from '../entity';

export abstract class BaseRepository<Entity extends NotificationBaseEntity>
  extends Repository<Entity> implements INotificationBaseRepository<Entity, number> {

  async findById(id: number): Promise<Entity | null> {
    return await this.findOne({ where: { id: id } }) ?? null;
  }

  async createEntity(data: Partial<Entity>): Promise<Entity | null> {
    const result = await this.insert(<QueryDeepPartialEntity<Entity>> data);
    const id = result.identifiers[0]?.id;
    return id ? this.findOneOrFail({ id }) : null;
  }

  async updateEntity(data: PartialRequired<Entity, 'id'>): Promise<Entity | null> {
    await this.update(data.id, <QueryDeepPartialEntity<Entity>> data);
    return this.findOneOrFail({ id: <any> data.id });
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.delete({ id: <any> id });
    return !!result.affected;
  }

  protected prepareFindManyOptions(options?: IOptions): FindManyOptions<Entity> {
    const result: FindManyOptions<Entity> = {};

    if (options?.order) {
      result.order = <any> options.order;
    }

    if (options?.offset) {
      result.skip = options.offset;
    }
    if (options?.limit) {
      result.take = options.limit;
    }

    return result;
  }
}
