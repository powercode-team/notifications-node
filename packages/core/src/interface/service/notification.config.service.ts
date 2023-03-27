import EventEmitter from 'events';
import { IObject } from '../common';
import { ITransportConfig } from '../transport';

export interface INotificationConfig extends Required<ITransportConfig> {
  eventEmitter: EventEmitter;
}

export interface INotificationConfigService {
  get<T>(name: keyof INotificationConfig, from?: IObject): T;
}
