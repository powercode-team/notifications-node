import { randomUUID } from 'crypto';
import { IEntity, IObject, IOptions } from '../../../interface';
import { PartialProps } from '../../../type';
import { Filter, MemoryCriteria, MemoryDriver } from '../memory.driver';

export abstract class MemoryNotificationBaseRepo<Entity extends IEntity<string>> {
  abstract entityClass: string;

  abstract instantiate(data?: Partial<Entity>): PartialProps<Entity, 'id'>;

  findBy(where: IObject | Filter<Entity>, options?: IOptions): Promise<Entity[]> {
    return Promise.resolve(MemoryDriver.findBy(this.entityClass, where, options));
  }

  count(criteria?: MemoryCriteria<Entity>): Promise<number> {
    return Promise.resolve(MemoryDriver.count(this.entityClass, criteria));
  }

  protected create(data: Partial<Entity>): Promise<Entity> {
    const entity = this.instantiate(<Partial<Entity>> data);

    if (!entity.id) {
      entity.id = this.generatePrimaryKey();
    } else if (MemoryDriver.findById(this.entityClass, entity.id)) {
      throw new Error(`Conflict id: '${ entity.id }' already exist in '${ this.entityClass }'`);
    }

    return Promise.resolve(MemoryDriver.save<Entity>(this.entityClass, <Entity> entity));
  }

  protected update(id: string, data: Partial<Entity>): Promise<Entity> {
    const entity: Entity = <Entity> MemoryDriver.findById(this.entityClass, id);
    if (!entity) {
      throw new Error(`Not found ${ this.entityClass } entity with id: ${ id }`);
    }

    Object.assign(entity, data);

    return Promise.resolve(MemoryDriver.save(this.entityClass, entity));
  }

  protected delete(criteria: MemoryCriteria<Entity>): Promise<number> {
    return Promise.resolve(MemoryDriver.deleteBy<Entity>(this.entityClass, criteria));
  }

  protected generatePrimaryKey(): string {
    let id: string;
    // eslint-disable-next-line no-empty
    while (MemoryDriver.findById(this.entityClass, id = randomUUID())) {}
    return id;
  }
}
