import { Criteria, INotificationQueueEntity, INotificationQueueRepo, PK } from '@node-notifications/core';
import { NotificationBaseRepo } from './notification.base.repo';

export class NotificationQueueRepo<
  Id extends PK = PK,
  Entity extends INotificationQueueEntity<Id> = INotificationQueueEntity<Id>,
>
  extends NotificationBaseRepo<Entity, Id>
  implements INotificationQueueRepo<Id> {

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
