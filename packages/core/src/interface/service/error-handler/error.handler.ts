import { IResponse } from '../../response';
import { INotificationQueueEntity } from '../../storage';
import { ITransport } from '../../transport';

export interface IErrorHandler {
  handleError(queue: INotificationQueueEntity, transport: ITransport, response: IResponse): Promise<INotificationQueueEntity>;
}
