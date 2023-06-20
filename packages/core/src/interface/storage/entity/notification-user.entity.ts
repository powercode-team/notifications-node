import { PK } from '../../../type';
import { INotificationUser } from '../../common';
import { IEntity } from './entity';

export interface INotificationUserEntity<Id extends PK = PK> extends IEntity<Id>, INotificationUser<Id> {
  /** Name */
  name?: string;

  /** Email */
  email?: string;

  /** Phone */
  phone?: string;
}
