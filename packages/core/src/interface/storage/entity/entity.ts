import { PrimaryKey } from '../../../type';

export interface IEntity<ID extends PrimaryKey> {
  /** Primary key */
  id: ID;
}
