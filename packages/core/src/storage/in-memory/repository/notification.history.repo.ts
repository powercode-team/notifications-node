import { INotificationHistoryEntity, INotificationHistoryRepo } from '../../../interface';
import { NotificationStatusEnum, PartialProps } from '../../../type';
import { MemoryNotificationEntity } from '../entity/notification.history.entity';
import { MemoryCriteria, MemoryDriver } from '../memory.driver';
import { MemoryNotificationBaseRepo } from './notification.base.repo';

type Entity = INotificationHistoryEntity<string, string>;

export class MemoryNotificationHistoryRepo
  extends MemoryNotificationBaseRepo<Entity>
  implements INotificationHistoryRepo<string, string> {

  entityClass = MemoryNotificationEntity.name;

  instantiate(data?: Partial<Entity>): PartialProps<Entity, 'id'> {
    const entity = new MemoryNotificationEntity();

    return Object.assign(entity, data);
  }

  createHistory(data: Partial<Entity>): Promise<Entity> {
    return this.create(data);
  }

  updateHistory(id: string, data: Partial<Entity>): Promise<Entity> {
    return this.update(id, data);
  }

  markAsRead(criteria: MemoryCriteria<Entity>): Promise<number> {
    return Promise.resolve(
      MemoryDriver.update<Entity>(this.entityClass, criteria, { status: NotificationStatusEnum.READ }).length,
    );
  }
}
