import { PK } from '../../../type';
import { Criteria } from '../../common';
import { INotificationQueueEntity } from '../entity';

export interface INotificationQueueRepo<Id extends PK = PK> {
  addToQueue(data: Partial<INotificationQueueEntity>): Promise<INotificationQueueEntity>;

  updateQueue(id: Id, data: Partial<INotificationQueueEntity>): Promise<INotificationQueueEntity>;

  deleteFromQueue(criteria: Criteria<Id>): Promise<number>;

  /**
   * Find QueueEntity ready for sending
   *
   * Must set IQueueEntity::inProcess attribute to "true"
   */
  findForProcessing(transport: string, limit?: number): Promise<INotificationQueueEntity<Id>[]>;
}
