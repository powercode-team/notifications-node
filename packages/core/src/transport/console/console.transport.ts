import { IDataProvider, IResponse, ITransportConfig } from '../../interface';
import { DummyBucketService } from '../../service';
import { DummyErrorHandler } from '../../service/error-handler/dummy.error-handler';
import { NotificationStatusEnum } from '../../type';
import { AbstractTransport } from '../abstract.transport';
import { IConsoleData } from './console-data.interface';
import { ConsoleDataProvider } from './console-data.provider';

export const TRANSPORT_CONSOLE = 'console';

export class ConsoleTransport extends AbstractTransport<IConsoleData> {
  config?: ITransportConfig = {
    errorHandler: new DummyErrorHandler(),
    leakyBucket: new DummyBucketService(),
  };

  constructor(
    dataProvider: IDataProvider<IConsoleData> = new ConsoleDataProvider(),
  ) {
    super(dataProvider);
  }

  send(data: IConsoleData): Promise<IResponse> {
    console.log(`Notification to: ${data.to}\n Data: ${data.text}`);

    return Promise.resolve({
      status: NotificationStatusEnum.SENT,
      response: { success: true },
    });
  }
}
