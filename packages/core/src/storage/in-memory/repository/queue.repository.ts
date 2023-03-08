import {
  ILeakyBucketEntity,
  ILeakyBucketRepository,
  INotificationQueueEntity,
  INotificationQueueRepository,
  IOptions,
} from '../../../interface';
import { NotificationStatusEnum, PartialProps, PROCESSING_STATUSES } from '../../../type';
import { MemoryQueueEntity } from '../entity';
import { MemoryBaseRepository } from './base.repository';

type Entity = INotificationQueueEntity<string>;

export class MemoryQueueRepository extends MemoryBaseRepository<Entity> implements INotificationQueueRepository<string>, ILeakyBucketRepository {
  entityClass = MemoryQueueEntity.name;

  instantiate(data?: Partial<Entity>): PartialProps<Entity, 'id'> {
    const entity = new MemoryQueueEntity();

    const { id, ...params } = data ?? {};
    Object.assign(entity, params);

    return entity;
  }

  findForProcessing(transport: string, limit?: number): Promise<Entity[]> {
    const now = new Date();

    return this.update({ inProcess: true }, item => {
      return !item.inProcess
        && item.transport === transport
        && item.nextSend
        && item.nextSend <= now
        && PROCESSING_STATUSES.includes(item.status);
    }, {
      order: {
        'nextSend': 'ASC',
      },
      limit,
    });
  }

  findByTransport(transport: string | string[], options?: IOptions): Promise<Entity[]> {
    if (transport.length < 1) {
      throw new Error('Undefined transport');
    }

    return this.findBy({ transport }, options);
  }


  /**
   * LeakyBucket Repository Interface
   */

  protected leakyStatuses = [NotificationStatusEnum.SENT, NotificationStatusEnum.FAILED];

  leakyBucketPut(data: ILeakyBucketEntity): Promise<ILeakyBucketEntity | null> {
    if (!this.leakyStatuses.includes(data.status)) {
      return Promise.resolve(null);
    }

    return this.createEntity(this.instantiate(data));
  }

  leakyBucketCount(transport: string, date: Date): Promise<number> {
    return this.count(item => !item.inProcess && item.transport === transport && item.sentAt && item.sentAt >= date);
  }

  leakyBucketClear(transport: string, date: Date): Promise<number> {
    return this.deleteBy(item => !item.inProcess && item.transport === transport && item.sentAt && item.sentAt < date
      && this.leakyStatuses.includes(item.status),
    );
  }
}
