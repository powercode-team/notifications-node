import { IDataProvider, INotification } from '@node-notifications/core';
import { IMailData } from './mail-data.interface';

/**
 * Transform data from INotification format to IMailData format
 */
export class MailDataProvider<Notification extends INotification = INotification> implements IDataProvider<IMailData, Notification> {
  prepareTransportData(notification: Notification, transportData?: Partial<IMailData> | null): Promise<IMailData> {
    if (!notification.recipient?.email) {
      throw new Error(`Undefined email for recipient: ${ JSON.stringify(notification.recipient) }`);
    }
    if (notification.sender && !notification.sender.email) {
      throw new Error(`Undefined email for sender: ${ JSON.stringify(notification.sender) }`);
    }

    const mailerData: IMailData = {
      to: `${ notification.recipient.email } ${ notification.recipient.name ?? '' }`,
      subject: typeof notification.data === 'string' ? undefined : notification.data.subject,
      html: typeof notification.data === 'string' ? notification.data : notification.data.body,
    };

    if (notification.sender) {
      mailerData.from = `${ notification.sender.email } ${ notification.sender.name ?? '' }`;
    }

    return Promise.resolve({ ...mailerData, ...transportData });
  }
}
