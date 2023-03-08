import { INotificationEntity } from '../../../interface';
import { MemoryNotificationBase } from './notification.base';

export class MemoryNotificationEntity extends MemoryNotificationBase implements INotificationEntity<string, string> {
  /** Recipient ID */
  recipientId?: string;

  /** Sender ID */
  senderId?: string;
}
