import { INotificationUser } from './notification-user';
import { IObject } from './object';

interface IBaseNotification<Data = IObject | string> {
  /** Notification Data */
  data: Data;

  /** Optional Sender */
  sender?: INotificationUser;
}

/**
 * Notification Interface
 */
export interface INotification<Data = IObject | string> extends IBaseNotification<Data> {
  /** Notification Recipient */
  recipient: INotificationUser;
}

/**
 * Batch Notifications Interface
 */
export interface IBatchNotification<Data = IObject | string> extends IBaseNotification<Data> {
  /** Notification Recipient */
  recipients: INotificationUser[] | INotificationUser;
}
