import { IDataProvider, IObject, IResponse, ITransport } from '../interface';
import { NotificationStatusEnum } from '../type';

export abstract class AbstractTransport<TRANSPORT_DATA extends IObject> implements ITransport<TRANSPORT_DATA> {
  abstract alias: string;

  protected constructor(
    public readonly dataProvider: IDataProvider<TRANSPORT_DATA>,
  ) {}

  abstract send(data: TRANSPORT_DATA): Promise<IResponse>;

  checkStatus(sendResponse: IObject): Promise<IResponse> {
    return Promise.resolve({
      status: NotificationStatusEnum.SENT,
      response: {},
    });
  }
}
