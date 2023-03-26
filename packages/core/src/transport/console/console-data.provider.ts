import { IDataProvider, INotification } from '../../interface';
import { IConsoleData } from './console-data.interface';

/**
 * Transform data from INotification format to IConsoleData format
 */
export class ConsoleDataProvider<Notification extends INotification = INotification> implements IDataProvider<IConsoleData, Notification> {
  prepareTransportData(notification: Notification, transportData?: Partial<IConsoleData> | null): Promise<IConsoleData> {
    return Promise.resolve({
      to: typeof notification.recipient === 'string'
        ? notification.recipient
        : JSON.stringify(notification.recipient),

      text: typeof notification.payload === 'string'
        ? notification.payload
        : `${notification.payload.subject}|${notification.payload.body}`,

      ...transportData,
    });
  }
}
