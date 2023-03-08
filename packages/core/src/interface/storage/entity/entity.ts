import { PK } from '../../../type';

export interface IEntity<Id extends PK> {
  /** Primary key */
  id: Id;
}
