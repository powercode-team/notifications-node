import { INotificationQueueRepository, IOptions, PROCESSING_STATUSES } from '@node-notifications/core';
import { EntityManager, EntityRepository, In, Raw } from 'typeorm';
import { NotificationQueueEntity } from '../entity';
import { BaseRepository } from './base.repository';

@EntityRepository(NotificationQueueEntity)
export class NotificationQueueRepository extends BaseRepository<NotificationQueueEntity> implements INotificationQueueRepository<number> {
  async findForProcessing(transport: string, limit?: number): Promise<NotificationQueueEntity[]> {
    return this.manager.transaction(async (em: EntityManager) => {
      const result: { id: number }[] = await em.createQueryBuilder(NotificationQueueEntity, 'queue')
        .select('id')
        .where({
          inProcess: false,
          transport: transport,
          nextSend: Raw(val => `${val} IS NOT NULL AND ${val} <= NOW()`),
          status: In(PROCESSING_STATUSES),
        })
        .orderBy('next_send', 'ASC')
        .limit(limit)
        .setLock('pessimistic_write')
        .getRawMany();

      const where = { id: In(result.map(e => e.id)) };

      await em.update(NotificationQueueEntity, where, { inProcess: true });

      return em.find(NotificationQueueEntity, { where, order: { nextSend: 'ASC' } });
    });
  }

  findByTransport(transport: string, options?: IOptions): Promise<NotificationQueueEntity[]> {
    return this.find({
      where: { transport },
      ...this.prepareFindManyOptions(options),
    });
  }
}
