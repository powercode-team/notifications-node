import { INotificationEntity } from '../../../interface';
import { NotificationBase } from './notification.base';

export class MemoryNotificationEntity extends NotificationBase implements INotificationEntity<string, string> {
  /** Recipient ID */
  recipientId?: string;

  /** Sender ID */
  senderId?: string;
}
