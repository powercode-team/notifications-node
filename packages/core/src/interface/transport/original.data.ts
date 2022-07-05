import { IObject } from '../common';
import { IUserEntity } from '../storage/entity';
import { IOriginalPayload } from './original.payload';

/**
 * General Original Data
 */
export interface IOriginalData<PAYLOAD_TYPE extends IOriginalPayload = IOriginalPayload> {
  /** Notification recipient */
  recipient: IUserEntity | string;

  /** Optional sender */
  sender?: IUserEntity;

  /** Payload data */
  payload: PAYLOAD_TYPE | string;

  /** Transport specific params */
  transports?: { [transportAlias: string]: IObject };
}
