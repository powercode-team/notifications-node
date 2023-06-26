import { INotificationHistoryRepo, INotificationQueueRepo } from '../storage';
import { ITransportCollection, ITransportConfig } from '../transport';
import { IEventEmitter } from './event-emitter';

export interface INotificationConfig {
  historyRepo: INotificationHistoryRepo,
  queueRepo: INotificationQueueRepo,
  transports: ITransportCollection,
  transportConfig?: ITransportConfig,
  eventEmitter?: IEventEmitter;
}
