import { IOptions, IQueueRepository, PROCESSING_STATUSES } from '@notifications-system/core';
import { EntityManager, EntityRepository, In, Raw } from 'typeorm';
import { QueueEntity } from '../entity';
import { BaseRepository } from './base.repository';

@EntityRepository(QueueEntity)
export class QueueRepository extends BaseRepository<QueueEntity, string> implements IQueueRepository<string> {
  async findForProcessing(transport: string, limit?: number): Promise<QueueEntity[]> {
    return this.manager.transaction(async (em: EntityManager) => {
      const result: { id: string }[] = await em.createQueryBuilder(QueueEntity, 'queue')
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
        .execute();

      const where = { id: In(result.map(e => e.id)) };

      await em.update(QueueEntity, where, { inProcess: true });

      return em.find(QueueEntity, { where, order: { nextSend: 'ASC' } });
    });
  }

  findByTransport(transport: string, options?: IOptions): Promise<QueueEntity[]> {
    return this.find({
      where: { transport },
      ...this.prepareFindManyOptions(options),
    });
  }
}
