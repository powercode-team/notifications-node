import { randomUUID } from 'crypto';
import { IBaseRepository, IEntity, IObject, IOptions } from '../../../interface';
import { PartialProps, PartialRequired } from '../../../type';
import { Filter, MemoryDriver } from '../memory.driver';

export abstract class MemoryBaseRepository<Entity extends IEntity<string>> implements IBaseRepository<Entity, string> {
  abstract entityClass: string;

  abstract instantiate(data?: Partial<Entity>): PartialProps<Entity, 'id'>;

  findByID(id: string): Promise<Entity | null> {
    return Promise.resolve(MemoryDriver.findById<Entity>(this.entityClass, id));
  }

  findBy(filter?: IObject | Filter<Entity>, options?: IOptions): Promise<Entity[]> {
    return Promise.resolve(MemoryDriver.findBy(this.entityClass, this.filter(filter), options));
  }

  async update(data: Partial<Entity>, filter?: IObject | Filter<Entity>, options?: IOptions): Promise<Entity[]> {
    return Promise.resolve(MemoryDriver.update(this.entityClass, data, this.filter(filter), options));
  }

  createEntity(data: Partial<Entity>): Promise<Entity | null> {
    const entity = this.instantiate(<Partial<Entity>> data);

    if (!entity.id) {
      entity.id = this.generatePrimaryKey();
    } else if (MemoryDriver.findById(this.entityClass, entity.id)) {
      throw new Error(`Conflict id: '${entity.id}' already exist in '${this.entityClass}'`);
    }

    return Promise.resolve(MemoryDriver.save<Entity>(this.entityClass, <Entity> entity));
  }

  updateEntity(data: PartialRequired<Entity, 'id'>): Promise<Entity | null> {
    const entity: Entity = <Entity> MemoryDriver.findById(this.entityClass, data.id);
    if (!entity) {
      return Promise.resolve(null);
    }

    Object.assign(entity, data);

    return Promise.resolve(MemoryDriver.save(this.entityClass, entity));
  }

  deleteByID(id: string): Promise<boolean> {
    return Promise.resolve(MemoryDriver.delete(this.entityClass, id) !== null);
  }

  deleteBy(filter?: IObject | Filter<Entity>): Promise<number> {
    return Promise.resolve(MemoryDriver.deleteBy(this.entityClass, this.filter(filter)));
  }

  count(filter?: IObject | Filter<Entity>): Promise<number> {
    return Promise.resolve(MemoryDriver.count(this.entityClass, this.filter(filter)));
  }

  protected generatePrimaryKey(): string {
    let id: string;
    while (MemoryDriver.findById(this.entityClass, id = randomUUID())) {}
    return id;
  }

  protected filter(filter?: IObject | Filter<Entity>): Filter<Entity> | undefined {
    // Undefined
    if (filter == null) {
      return undefined;
    }

    // Filter<Entity>
    if (typeof filter === 'function') {
      return <Filter<Entity>> filter;
    }

    // IObject
    return (entity: Entity) => {
      const properties = Object.getOwnPropertyNames(filter);
      let res = properties.length > 0;
      for (const prop of properties) {
        // @ts-ignore
        const val = entity[prop];
        if (filter[prop] == null) {
          res &&= !val;
        } else if (Array.isArray(filter[prop])) {
          res &&= filter[prop].includes(val);
        } else {
          res &&= (filter[prop] == val);
        }
      }
      return res;
    };
  }
}
