import { PrimaryKey } from '../../../type';
import { IEntity } from './entity';

export interface IUserEntity<ID extends PrimaryKey = PrimaryKey> extends IEntity<ID> {
  /** Name */
  name?: string;

  /** Email */
  email?: string | null;

  /** Phone */
  phone?: string | null;
}
