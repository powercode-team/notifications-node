import { IObject, IOptions, IOrderBy } from '../../interface';
import { BaseEntity } from './entity';

export type Filter<T extends IObject> = (value: T, index: number, array: T[]) => unknown;

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

  protected static getBy<T extends IObject>(type: string, filter?: Filter<T>, options?: IOptions): T[] {
    return this.collect(filter ? this.get(type).filter(<any> filter) : this.get(type), options);
  }

  protected static getById<T extends IObject>(type: string, id: string): T | null {
    return <T> this.get(type).find(obj => id === obj.id) ?? null;
  }

  static findBy<T extends IObject>(type: string, filter?: Filter<T>, options?: IOptions): T[] {
    return this.getBy(type, filter, options).map(e => ({ ...e }));
  }

  static findById<T extends IObject>(type: string, id: string): T | null {
    const entity = this.getById(type, id);
    return entity ? <T> { ...entity } : null;
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

  static update<T extends IObject>(type: string, attributes: IObject, filter?: Filter<T>, options?: IOptions): T[] {
    return this.getBy(type, filter, options).map(entity => {
      return { ...Object.assign(entity, attributes) };
    });
  }

  static delete<T extends IObject>(type: string, id: string): T | null {
    const entity = this.getById<T>(type, id);

    const ind = this.get(type).findIndex(item => item.id === id);
    if (ind >= 0) {
      this.get(type).splice(ind, 1);
    }

    return entity;
  }

  static deleteBy<T extends IObject>(type: string, filter?: Filter<T>): number {
    let ind: number;
    let count: number = 0;

    if (filter == null) {
      count = this.get(type).length;
      this.init(type);
      return count;
    }

    while ((ind = this.get(type).findIndex(<any> filter)) >= 0) {
      count++;
      this.get(type).splice(ind, 1);
    }

    return count;
  }

  static count<T extends IObject>(type: string, filter?: Filter<T>): number {
    return filter == null ? this.get(type).length : this.get(type).filter(<any> filter).length;
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
          case val1 instanceof BaseEntity:
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
}
