import { INotificationUser } from './notification-user';
import { IObject } from './object';

/**
 * Batch Notifications Interface
 */
export interface IBatchNotification<Data = IObject | string> {
  /** Notification Recipient */
  recipient: INotificationUser | INotificationUser[];

  /** Notification Data */
  data: Data;

  /** Optional Sender */
  sender?: INotificationUser;
}

/**
 * Notification Interface
 */
export interface INotification<Data = IObject | string> extends IBatchNotification<Data> {
  /** Notification Recipient */
  recipient: INotificationUser;
}
