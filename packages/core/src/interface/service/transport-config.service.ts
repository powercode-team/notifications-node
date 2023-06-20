import { IObject } from '../common';
import { ITransportConfig } from '../transport';

export interface ITransportConfigService {
  get<T>(name: keyof ITransportConfig, from?: IObject): T;
}
