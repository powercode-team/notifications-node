import { PrimaryKey } from '../../../type';
import { INotificationBase } from './notification.base';

/**
 * Notification (history) Entity Interface
 */
export interface INotificationEntity<ID extends PrimaryKey = PrimaryKey, USER_ID extends PrimaryKey = PrimaryKey>
  extends INotificationBase<ID> {

  /** Recipient ID */
  recipientId?: USER_ID;

  /** Sender ID */
  senderId?: USER_ID;
}
