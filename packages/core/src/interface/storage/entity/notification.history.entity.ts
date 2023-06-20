import { NotificationStatusEnum, PK } from '../../../type';
import { INotificationUser, IObject } from '../../common';
import { IEntity } from './entity';

/**
 * Notification "History" Interface
 */
export interface INotificationHistoryEntity<Id extends PK = PK, UserId extends PK = PK> extends IEntity<Id> {
  /** Notification status */
  status: NotificationStatusEnum;

  /** Recipient */
  recipient: INotificationUser<UserId>;

  /** Sender */
  sender?: INotificationUser<UserId>;

  /** Transport */
  transport: string;

  /** Transport Data */
  transportData: IObject;

  /** Transport Response */
  transportResponse: IObject | null;

  /** Sent attempts */
  sentAttempts: number;

  /** Sent At */
  sentAt: Date | null;

  /** Created At */
  createdAt: Date;
}
