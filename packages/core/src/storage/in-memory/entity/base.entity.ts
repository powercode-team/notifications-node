import { IEntity } from '../../../interface';

export abstract class MemoryBaseEntity implements IEntity<string> {
  /** Primary key */
  public id: string;
}
