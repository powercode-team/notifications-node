import { PK } from '../../type';
import { IObject } from './object';

/**
 * Notification User Interface
 */
export interface INotificationUser<Id extends PK = PK> extends IObject {
  id: Id;
  type?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
}
