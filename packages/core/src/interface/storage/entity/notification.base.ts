import { NotificationStatusEnum, PrimaryKey } from '../../../type';
import { IObject } from '../../common';
import { IEntity } from './entity';

/**
 * Notification Base Interface
 */
export interface INotificationBase<ID extends PrimaryKey> extends IEntity<ID> {
  /** Notification status */
  status: NotificationStatusEnum;

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
