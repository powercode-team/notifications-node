import {
  Criteria,
  INotificationHistoryEntity,
  INotificationHistoryRepo,
  INotificationQueueEntity,
  INotificationQueueRepo,
  PK,
} from '@node-notifications/core';
import { EntityRepository, FindConditions } from 'typeorm';
import { NotificationEntity } from '../entity';
import { NotificationBaseRepo } from './notification.base.repo';

export type INotificationEntity<Id extends PK = PK, UserId extends PK = PK>
  = INotificationHistoryEntity<Id, UserId> & INotificationQueueEntity<Id>;

@EntityRepository(NotificationEntity)
export class NotificationRepo<
  Id extends PK = PK,
  UserId extends PK = PK,
  Entity extends INotificationEntity<Id, UserId> = INotificationEntity<Id, UserId>,
>
  extends NotificationBaseRepo<Entity, Id, UserId>
  implements INotificationHistoryRepo<Id, UserId>, INotificationQueueRepo<Id> {

  // INotificationHistoryRepo

  createHistory(data: Partial<Entity>): Promise<Entity> {
    return this.createEntity(data);
  }

  updateHistory(id: Id, data: Partial<Entity>): Promise<Entity> {
    return this.updateEntity(id, data);
  }

  markAsRead(criteria: Criteria<Id> | FindConditions<Entity>): Promise<number> {
    return super.markAsRead(criteria);
  }

  // INotificationQueueRepo

  addToQueue(data: Partial<Entity>): Promise<Entity> {
    return this.createEntity(data);
  }

  updateQueue(id: Id, data: Partial<Entity>): Promise<Entity> {
    return this.updateEntity(id, data);
  }

  deleteFromQueue(criteria: Criteria<Id>): Promise<number> {
    return this.deleteEntity(criteria);
  }

  findForProcessing(transport: string, limit?: number): Promise<Entity[]> {
    return super.findForProcessing(transport, limit);
  }
}
