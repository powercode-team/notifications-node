import { PartialRequired, PrimaryKey } from '../../../type';
import { IEntity } from '../entity';

export interface IBaseRepository<Entity extends IEntity<ID>, ID extends PrimaryKey = PrimaryKey> {
  findByID(id: ID): Promise<Entity | null>;

  createEntity(data: Partial<Entity>): Promise<Entity | null>;

  updateEntity(data: PartialRequired<Entity, 'id'>): Promise<Entity | null>;

  deleteByID(id: ID): Promise<boolean>;
}
