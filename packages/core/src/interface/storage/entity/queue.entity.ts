import { PrimaryKey } from '../../../type';
import { INotificationBase } from './notification.base';
import { INotificationEntity } from './notification.entity';

/**
 * Queue Entity Interface
 */
export interface IQueueEntity<ID extends PrimaryKey = PrimaryKey> extends INotificationBase<ID> {
  /** Related Notification */
  notification: INotificationEntity<ID> | null;

  /** Next try to send */
  nextSend: Date | null;

  /** In processing */
  inProcess: boolean;
}
