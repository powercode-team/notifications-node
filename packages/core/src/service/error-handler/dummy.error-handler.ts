import { IErrorHandler, INotificationQueueEntity, IResponse, ITransport } from '../../interface';

export class DummyErrorHandler implements IErrorHandler {
  handleError(queue: INotificationQueueEntity, transport: ITransport, response: IResponse): Promise<INotificationQueueEntity> {
    return Promise.resolve(queue);
  }
}
