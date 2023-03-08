import { PK } from '../../../type';
import { INotificationBaseEntity } from './notification.base.entity';

/**
 * Notification (history) Entity Interface
 */
export interface INotificationEntity<Id extends PK = PK, UserId extends PK = PK> extends INotificationBaseEntity<Id> {
  /** Recipient ID */
  recipientType?: string;
  recipientId?: UserId;

  /** Sender ID */
  senderType?: string;
  senderId?: UserId;
}
