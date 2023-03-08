import { PK } from '../../../type';
import { INotificationBaseEntity } from './notification.base.entity';
import { INotificationEntity } from './notification.entity';

/**
 * Notification Queue Entity Interface
 */
export interface INotificationQueueEntity<Id extends PK = PK> extends INotificationBaseEntity<Id> {
  /** Related Notification */
  notification: INotificationEntity<Id> | null;

  /** Next try to send */
  nextSend: Date | null;

  /** In processing */
  inProcess: boolean;
}
