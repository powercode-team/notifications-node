import EventEmitter from 'events';
import { IObject, ITransportConfig } from '../common';

export interface IConfig extends Required<ITransportConfig> {
  eventEmitter: EventEmitter;
}

export interface IConfigService {
  get<T extends any>(name: keyof IConfig, from?: IObject): T;
}
