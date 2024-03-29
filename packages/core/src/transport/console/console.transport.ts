import { IDataProvider, IResponse } from '../../interface';
import { NotificationStatusEnum } from '../../type';
import { AbstractTransport } from '../abstract.transport';
import { IConsoleData } from './console-data.interface';
import { ConsoleDataProvider } from './console-data.provider';

export class ConsoleTransport extends AbstractTransport<IConsoleData> {
  constructor(
    dataProvider: IDataProvider<IConsoleData> = new ConsoleDataProvider(),
  ) {
    super(dataProvider);
  }

  send(data: IConsoleData): Promise<IResponse> {
    console.log(`Send to: ${ data.to }\n Data: ${ data.text }`);

    return Promise.resolve({
      status: NotificationStatusEnum.SENT,
      response: { success: true },
    });
  }
}
