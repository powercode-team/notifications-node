import { IResponse } from '../../response';
import { IQueueEntity } from '../../storage';
import { ITransport } from '../../transport';

export interface IErrorHandler {
  handleError(queue: IQueueEntity, transport: ITransport, response: IResponse): Promise<IQueueEntity>;
}
