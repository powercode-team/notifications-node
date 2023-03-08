import { PK } from '../../type';

/**
 * Notification User Interface
 */
export interface INotificationUser<Id extends PK = PK> {
  id?: Id;
  name?: string;
  email?: string | null;
  phone?: string | null;
}
