import { PK } from '../../../type';

export interface IEntity<Id extends PK = PK> {
  /** Primary key */
  id: Id;
}
