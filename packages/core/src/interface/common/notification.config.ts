import EventEmitter from 'events';
import { INotificationHistoryRepo, INotificationQueueRepo } from '../storage';
import { ITransportCollection, ITransportConfig } from '../transport';

export interface INotificationConfig {
  historyRepo: INotificationHistoryRepo,
  queueRepo: INotificationQueueRepo,
  transports: ITransportCollection,
  transportConfig?: ITransportConfig,
  eventEmitter?: EventEmitter;
}
