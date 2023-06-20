import { IDataProvider, INotification } from '../../interface';
import { IConsoleData } from './console-data.interface';

/**
 * Transform data from INotification format to IConsoleData format
 */
export class ConsoleDataProvider<Notification extends INotification = INotification> implements IDataProvider<IConsoleData, Notification> {
  prepareTransportData(notification: Notification, transportData?: Partial<IConsoleData> | null): Promise<IConsoleData> {
    return Promise.resolve({
      to: `${ notification.recipient.email } ${ notification.recipient.name }`,

      text: typeof notification.data === 'string'
        ? notification.data
        : JSON.stringify(notification.data),

      ...transportData,
    });
  }
}
