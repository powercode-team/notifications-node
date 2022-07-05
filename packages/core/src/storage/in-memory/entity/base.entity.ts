import { IEntity } from '../../../interface';

export abstract class BaseEntity implements IEntity<string> {
  /** Primary key */
  public id: string;
}
