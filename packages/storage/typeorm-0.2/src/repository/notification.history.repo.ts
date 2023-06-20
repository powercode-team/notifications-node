import { Criteria, INotificationHistoryEntity, INotificationHistoryRepo, PK } from '@node-notifications/core';
import { EntityRepository, FindConditions } from 'typeorm';
import { NotificationHistoryEntity } from '../entity';
import { NotificationBaseRepo } from './notification.base.repo';

@EntityRepository(NotificationHistoryEntity)
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

  markAsRead(criteria: Criteria<Id> | FindConditions<Entity>): Promise<number> {
    return super.markAsRead(criteria);
  }
}
