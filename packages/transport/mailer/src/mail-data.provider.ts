import { IDataProvider, IOriginalData } from '@notifications-system/core';
import { IMailData } from './mail-data.interface';

/**
 * Transform data from ORIGINAL_DATA format to TRANSPORT_DATA format
 */
export class MailDataProvider<ORIGINAL_DATA extends IOriginalData = IOriginalData> implements IDataProvider<IMailData, ORIGINAL_DATA> {
  originToTransport(originalData: ORIGINAL_DATA, transportData?: Partial<IMailData>): Promise<IMailData> {
    if (typeof originalData.recipient !== 'string' && !originalData.recipient?.email) {
      throw new Error(`Undefined email for recipient ID: ${originalData.recipient.id}`);
    }

    const mailerData: IMailData = {
      to: typeof originalData.recipient === 'string'
        ? originalData.recipient
        : `${originalData.recipient.email} ${originalData.recipient.name}`,
      subject: typeof originalData.payload === 'string' ? '' : originalData.payload.title,
      html: typeof originalData.payload === 'string' ? originalData.payload : originalData.payload.body,
    };

    if (originalData.sender?.email) {
      mailerData.from = `${originalData.sender.email} ${originalData.sender.name}`;
    }

    return Promise.resolve({ ...mailerData, ...transportData });
  }
}
