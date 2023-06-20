import { Criteria, INotificationQueueEntity, INotificationQueueRepo } from '../../../interface';
import { PartialProps, PROCESSING_STATUSES } from '../../../type';
import { MemoryNotificationQueueEntity } from '../entity';
import { MemoryDriver } from '../memory.driver';
import { MemoryNotificationBaseRepo } from './notification.base.repo';

type Entity = INotificationQueueEntity<string>;

export class MemoryNotificationQueueRepo
  extends MemoryNotificationBaseRepo<Entity>
  implements INotificationQueueRepo<string> {

  entityClass = MemoryNotificationQueueEntity.name;

  instantiate(data?: Partial<Entity>): PartialProps<Entity, 'id'> {
    const entity = new MemoryNotificationQueueEntity();

    const { id, ...params } = data ?? {};

    return Object.assign(entity, params);
  }

  addToQueue(data: Partial<Entity>): Promise<Entity> {
    return this.create(data);
  }

  updateQueue(id: string, data: Partial<Entity>): Promise<Entity> {
    return this.update(id, data);
  }

  deleteFromQueue(criteria: Criteria<string>): Promise<number> {
    return this.delete(criteria);
  }

  findForProcessing(transport: string, limit?: number): Promise<Entity[]> {
    const now = new Date();

    const result = MemoryDriver.update<Entity>(
      this.entityClass,
      item => !item.inProcess
        && item.transport === transport
        && item.nextSend
        && item.nextSend <= now
        && PROCESSING_STATUSES.includes(item.status),
      {
        inProcess: true,
      },
      {
        order: {
          'nextSend': 'ASC',
        },
        limit,
      },
    );

    return Promise.resolve(result);
  }
}
