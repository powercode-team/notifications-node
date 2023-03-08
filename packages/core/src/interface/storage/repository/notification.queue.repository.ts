import { PK } from '../../../type';
import { INotificationQueueEntity } from '../entity';
import { INotificationBaseRepository } from './notification.base.repository';

export interface INotificationQueueRepository<Id extends PK = PK> extends INotificationBaseRepository<INotificationQueueEntity<Id>, Id> {
  /**
   * Find QueueEntity ready for sending;
   *
   * Must set IQueueEntity::inProcess attribute to "true"
   */
  findForProcessing(transport: string, limit?: number): Promise<INotificationQueueEntity<Id>[]>;
}
