import EventEmitter from 'events';
import { IObject, ITransportConfig } from '../common';

export interface INotificationConfig extends Required<ITransportConfig> {
  eventEmitter: EventEmitter;
}

export interface INotificationConfigService {
  get<T>(name: keyof INotificationConfig, from?: IObject): T;
}
