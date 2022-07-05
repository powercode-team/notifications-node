import { IObject, ITransportConfig } from '../common';
import { IResponse } from '../response';
import { IDataProvider } from './data.provider';

/** Transport Interface */
export interface ITransport<TRANSPORT_DATA extends IObject = IObject> {
  /** Transport Alias */
  alias: string;

  /** Data Provider */
  dataProvider: IDataProvider<TRANSPORT_DATA>;

  /**
   * Transport Config
   */
  config?: ITransportConfig;

  /**
   * Send data
   */
  send(data: TRANSPORT_DATA): Promise<IResponse>;

  /**
   * Check status
   *
   * sendResponse - raw response returned by transport send method (IResponse.response)
   */
  checkStatus(sendResponse: IObject): Promise<IResponse>;
}
