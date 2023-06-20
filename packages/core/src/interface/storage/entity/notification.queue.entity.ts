import { PK } from '../../../type';
import { INotificationHistoryEntity } from './notification.history.entity';

/**
 * Notification Queue Entity Interface
 */
export interface INotificationQueueEntity<Id extends PK = PK> extends INotificationHistoryEntity<Id> {
  /** Next try to send */
  nextSend: Date | null;

  /** Flag "In processing" */
  inProcess: boolean;
}
