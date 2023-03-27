import { IDataProvider, INotification } from '@node-notifications/core';
import { IMailData } from './mail-data.interface';

/**
 * Transform data from INotification format to IMailData format
 */
export class MailDataProvider<Notification extends INotification = INotification> implements IDataProvider<IMailData, Notification> {
  prepareTransportData(notification: Notification, transportData?: Partial<IMailData> | null): Promise<IMailData> {
    if (typeof notification.recipient !== 'string' && !notification.recipient?.email) {
      throw new Error(`Undefined email for recipient: ${notification.recipient}`);
    }

    const mailerData: IMailData = {
      to: typeof notification.recipient === 'string'
        ? <string> notification.recipient
        : `${notification.recipient.email} ${notification.recipient.name ?? ''}`,

      subject: typeof notification.payload === 'string' ? undefined : notification.payload.subject,
      html: typeof notification.payload === 'string' ? notification.payload : notification.payload.body,
    };

    if (notification.sender) {
      mailerData.from = typeof notification.sender === 'string'
        ? <string> notification.recipient
        : `${notification.sender.email} ${notification.sender.name ?? ''}`;
    }

    return Promise.resolve({ ...mailerData, ...transportData });
  }
}
