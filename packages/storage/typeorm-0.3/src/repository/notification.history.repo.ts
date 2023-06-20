import { Criteria, INotificationHistoryEntity, INotificationHistoryRepo, PK } from '@node-notifications/core';
import { FindOptionsWhere } from 'typeorm';
import { NotificationBaseRepo } from './notification.base.repo';

export class NotificationHistoryRepo<
  Id extends PK = PK,
  UserId extends PK = PK,
  Entity extends INotificationHistoryEntity<Id, UserId> = INotificationHistoryEntity<Id, UserId>,
>
  extends NotificationBaseRepo<Entity, Id, UserId>
  implements INotificationHistoryRepo<Id, UserId> {

  createHistory(data: Partial<Entity>): Promise<Entity> {
    return this.createEntity(data);
  }

  updateHistory(id: Id, data: Partial<Entity>): Promise<Entity> {
    return this.updateEntity(id, data);
  }

  markAsRead(criteria: Criteria<Id> | FindOptionsWhere<Entity>): Promise<number> {
    return super.markAsRead(criteria);
  }
}
