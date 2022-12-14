import { INotificationBase, IObject } from '../../../interface';
import { NotificationStatusEnum } from '../../../type';
import { BaseEntity } from './base.entity';

export abstract class NotificationBase extends BaseEntity implements INotificationBase<string> {
  /** Notification status */
  status: NotificationStatusEnum;

  /** Transport */
  transport: string;

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
