import { INotificationHistoryEntity, INotificationUser, IObject } from '../../../interface';
import { NotificationStatusEnum } from '../../../type';
import { MemoryBaseEntity } from './base.entity';

export class MemoryNotificationEntity extends MemoryBaseEntity implements INotificationHistoryEntity<string> {
  /** Notification status */
  status: NotificationStatusEnum;

  /** Transport */
  transport: string;

  /** Recipient */
  recipient: INotificationUser<string>;

  /** Sender */
  sender?: INotificationUser<string>;

  /** Transport Data */
  transportData: IObject;

  /** Transport Response */
  transportResponse: IObject | null = null;

  /** Sent attempts */
  sentAttempts: number = 0;

  /** Sent At */
  sentAt: Date | null = null;

  /** Created At */
  createdAt: Date = new Date();
}
