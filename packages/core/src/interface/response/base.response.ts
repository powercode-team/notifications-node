import { NotificationStatusEnum } from '../../type';
import { IObject } from '../common';

export interface IResponse {
  /** Notification Status */
  status: NotificationStatusEnum;

  /** Raw transport response */
  response: IObject;
}
