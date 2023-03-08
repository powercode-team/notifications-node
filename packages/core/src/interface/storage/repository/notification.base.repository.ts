import { PartialRequired, PK } from '../../../type';
import { IEntity } from '../entity';

export interface INotificationBaseRepository<Entity extends IEntity<Id>, Id extends PK = PK> {
  findById(id: Id): Promise<Entity | null>;

  createEntity(data: Partial<Entity>): Promise<Entity | null>;

  updateEntity(data: PartialRequired<Entity, 'id'>): Promise<Entity | null>;

  deleteById(id: Id): Promise<boolean>;
}
