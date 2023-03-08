import { IObject } from '../common';
import { INotification } from '../common/notification';

/**
 * Prepare TRANSPORT_DATA format from INotification format
 */
export interface IDataProvider<TransportData extends IObject, Notification extends INotification = INotification> {
  /**
   * Prepare specific Transport Data from general Origin Data
   */
  prepareTransportData(notification: Notification, transportData?: Partial<TransportData> | null): Promise<TransportData>;
}
