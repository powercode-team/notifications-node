import { ObjectHelper } from '../../helper';
import { Criteria, IObject, IOptions, IOrderBy } from '../../interface';
import { MemoryBaseEntity } from './entity';

export type Filter<T extends IObject> = (value: T, index: number, array: T[]) => unknown;
export type MemoryCriteria<T extends IObject> = Criteria<string> | IObject | Filter<T>;

export class MemoryDriver {
  protected static storage: { [type: string]: IObject[] } = {};

  static init(type: string) {
    this.storage[type] = [];
  }

  protected static get<T extends IObject>(type: string): T[] {
    if (!this.storage[type]) {
      MemoryDriver.init(type);
    }
    return <T[]> this.storage[type];
  }

  protected static getBy<T extends IObject>(type: string, criteria?: MemoryCriteria<T>, options?: IOptions): T[] {
    let result: T[];

    if (criteria) {
      result = this.get(type).filter(<any> this.getFilter<T>(criteria));
    } else {
      result = this.get(type);
    }

    return this.collect<T>(result, options);
  }

  protected static getById<T extends IObject>(type: string, id: string): T | undefined {
    return <T> this.get(type).find(obj => id === obj.id) ?? undefined;
  }

  static findBy<T extends IObject>(type: string, criteria?: MemoryCriteria<T>, options?: IOptions): T[] {
    return this.getBy(type, criteria, options).map(e => ({ ...e }));
  }

  static findById<T extends IObject>(type: string, id: string): T | undefined {
    const entity = this.getById(type, id);
    return entity ? <T> { ...entity } : undefined;
  }

  static save<T extends IObject>(type: string, entity: T): T {
    const ind = this.get(type).findIndex(item => item.id === entity.id);
    if (ind >= 0) {
      this.get(type)[ind] = { ...entity };
    } else {
      this.get(type).push({ ...entity });
    }

    return entity;
  }

  static update<T extends IObject>(type: string, criteria: MemoryCriteria<T>, attributes: IObject, options?: IOptions): T[] {
    return this.getBy(type, criteria, options).map(entity => {
      return { ...Object.assign(entity, attributes) };
    });
  }

  static deleteBy<T extends IObject>(type: string, criteria?: MemoryCriteria<T>): number {
    let ind: number;
    let count: number = 0;

    if (criteria == null) {
      count = this.get(type).length;
      this.init(type);
      return count;
    }

    while ((ind = this.get(type).findIndex(<any> this.getFilter<T>(criteria))) >= 0) {
      count++;
      this.get(type).splice(ind, 1);
    }

    return count;
  }

  static deleteById<T extends IObject>(type: string, id: string): T | undefined {
    const entity = this.getById<T>(type, id);
    if (!entity) {
      return undefined;
    }

    const ind = this.get(type).findIndex(item => item.id === id);
    if (ind >= 0) {
      this.get(type).splice(ind, 1);
    }

    return entity;
  }

  static count<T extends IObject>(type: string, criteria?: MemoryCriteria<T>): number {
    return criteria == null ? this.get(type).length : this.get(type).filter(<any> this.getFilter<T>(criteria)).length;
  }

  static collect<T extends IObject>(collection: T[], options?: IOptions): T[] {
    const result = <T[]> [...collection];

    if (options?.order) {
      this.orderBy(result, options.order);
    }

    return options?.limit ? this.paginate(result, options) : result;
  }

  static orderBy<T extends IObject>(items: T[], order: IOrderBy): T[] {
    return items.sort((item1: Record<string, any>, item2: Record<string, any>) => {
      for (const key of Object.getOwnPropertyNames(order)) {
        let val1 = item1[key];
        let val2 = item2[key];
        switch (true) {
          case val1 instanceof Date || val2 instanceof Date:
            val1 = val1?.getTime();
            val2 = val2?.getTime();
            break;
          case val1 instanceof MemoryBaseEntity:
            val1 = val1.id;
            val2 = val2.id;
            break;
        }
        if (val1 != val2) {
          return val1 > val2 ? 1 : -1;
        }
      }
      return 0;
    });
  }

  static paginate<T extends IObject>(array: T[], options?: IOptions): T[] {
    const start = options?.offset && options.offset > 0 ? options.offset : 0;
    const end = options?.limit && options.limit > 0 ? options.limit + start : undefined;

    return array.slice(start, end);
  }

  static getFilter<Entity extends IObject>(criteria: string | string[] | IObject | Filter<Entity>): Filter<Entity> {
    if (criteria == null) throw new Error('Undefined \'criteria\' parameter');

    // Filter<Entity>
    if (typeof criteria === 'function') {
      return <Filter<Entity>> criteria;
    }

    // IObject
    return (entity: Entity) => {
      if (!ObjectHelper.isObject(criteria)) {
        criteria = { id: criteria };
      }
      criteria = criteria as IObject;

      const properties = Object.getOwnPropertyNames(criteria);
      let res = properties.length > 0;

      for (const prop of properties) {
        // @ts-ignore
        const val = entity[prop];
        if (criteria[prop] == null) {
          res &&= !val;
        } else if (Array.isArray(criteria[prop])) {
          res &&= criteria[prop].includes(val);
        } else {
          res &&= (criteria[prop] == val);
        }
      }

      return res;
    };
  }
}
