import { PK } from '../../../type';
import { IEntity } from './entity';

export interface INotificationUserEntity<Id extends PK = PK> extends IEntity<Id> {
  /** Name */
  name?: string;

  /** Email */
  email?: string | null;

  /** Phone */
  phone?: string | null;
}
