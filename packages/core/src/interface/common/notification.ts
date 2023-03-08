import { TransportParams } from '../transport/transport';
import { INotificationPayload } from './notification-payload';
import { INotificationUser } from './notification-user';

/**
 * Notification Interface
 */
export interface INotification {
  /** Notification recipient */
  recipient?: INotificationUser | string;

  /** Optional sender */
  sender?: INotificationUser | string;

  /** Payload data */
  payload: INotificationPayload | string;

  /** Transports: [alias] | TransportParams */
  transports: string[] | TransportParams;
}
