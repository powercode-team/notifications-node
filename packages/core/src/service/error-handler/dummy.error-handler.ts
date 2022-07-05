import { IErrorHandler, IQueueEntity, IResponse, ITransport } from '../../interface';

export class DummyErrorHandler implements IErrorHandler {
  handleError(queue: IQueueEntity, transport: ITransport, response: IResponse): Promise<IQueueEntity> {
    return Promise.resolve(queue);
  }
}
