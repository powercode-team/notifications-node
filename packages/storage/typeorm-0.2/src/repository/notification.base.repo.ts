import { Criteria, IEntity, INotificationQueueEntity, NotificationStatusEnum, PK, PROCESSING_STATUSES } from '@node-notifications/core';
import { EntityManager, FindConditions, In, Raw, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class NotificationBaseRepo<Entity extends IEntity<Id>, Id extends PK = PK, UserId extends PK = PK>
  extends Repository<Entity> {

  protected async createEntity(data: Partial<Entity>): Promise<Entity> {
    data = Object.assign(this.create(), data);

    const result = await this.insert(data as QueryDeepPartialEntity<Entity>);

    return this.findOneOrFail({ id: result.identifiers[0].id });
  }

  protected async updateEntity(id: Id, data: Partial<Entity>): Promise<Entity> {
    data = Object.assign(this.create(), data);

    await this.update(id, data as QueryDeepPartialEntity<Entity>);

    return this.findOneOrFail({ id: id as any });
  }

  protected async deleteEntity(criteria: Criteria<Id> | FindConditions<INotificationQueueEntity<Id>>): Promise<number> {
    if (criteria == null) return 0;

    const result = await this.delete(criteria as any);

    return result.affected ?? 0;
  }

  protected async findForProcessing(transport: string, limit?: number): Promise<Entity[]> {
    return this.manager.transaction(async (em: EntityManager) => {
      const qb = em
        .createQueryBuilder<Entity>(this.target, 'queue')
        .select('id')
        .where({
          inProcess: false,
          status: In(PROCESSING_STATUSES),
          transport: transport,
          nextSend: Raw(val => `${ val } IS NOT NULL AND ${ val } <= NOW()`),
        })
        .orderBy('next_send', 'ASC')
        .limit(limit)
        .setLock('pessimistic_write');

      const result: { id: number }[] = await qb.getRawMany();

      const where = { id: In(result.map(e => e.id)) };

      await em.update<Entity>(this.target, where, { inProcess: true } as any);

      return em.find<Entity>(this.target, { where, order: { nextSend: 'ASC' } as any });
    });
  }

  protected async markAsRead(criteria: Criteria<Id> | FindConditions<Entity>): Promise<number> {
    const result = await this.update(criteria as any, { status: NotificationStatusEnum.READ } as any);

    return result.affected ?? 0;
  }
}
