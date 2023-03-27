import { IObject } from '../common';
import { IResponse } from '../response';
import { IDataProvider } from './data.provider';
import { ITransportConfig } from './transport.config';

export type ITransportCollection = { [alias: string]: ITransport };

export type TransportParams = { [alias: string]: IObject };

/** Transport Interface */
export interface ITransport<TransportData extends IObject = IObject> {
  /** Data Provider */
  dataProvider: IDataProvider<TransportData>;

  /**
   * Transport Config
   */
  config?: ITransportConfig;

  /**
   * Send data
   */
  send(data: TransportData): Promise<IResponse>;

  /**
   * Check status
   *
   * sendResponse - raw response returned by transport send method (IResponse.response)
   */
  checkStatus(sendResponse: IObject): Promise<IResponse>;
}
