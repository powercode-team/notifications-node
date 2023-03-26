/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IObject } from '../interface';

export class ObjectHelper {
  static isObject(object: unknown): boolean {
    return null != object && typeof object === 'object';
  }

  static isEmpty(object: IObject | Array<unknown>): boolean {
    return null == object || !(Array.isArray(object) ? object.length : Object.getOwnPropertyNames(object).length);
  }

  static value(object: IObject | Array<unknown>, key: string) {
    return Array.isArray(object) ? null : object[key];
  }

  /**
   * Recursive assign properties from sources to target and return modified target
   */
  static assignDeep<T extends IObject, K extends IObject>(target: T, ...sources: K[]): T {
    return sources.reduce((result: T, source: K) => {
      if (!source) {
        return result;
      }

      Object.keys(source).forEach(key => {
        const res = result[key];
        const src = source[key];

        if (Array.isArray(res) && Array.isArray(src)) {
          // @ts-ignore
          result[key] = res.concat(...src);
        } else if (this.isObject(res) && this.isObject(src) && res.constructor.name === src.constructor.name) {
          // @ts-ignore
          result[key] = this.assignDeep(res, src);
        } else if (typeof res === 'undefined' || typeof src !== 'undefined') {
          // @ts-ignore
          result[key] = src;
        }
      });

      return result;
    }, target ?? <T> Object.create(Object.getPrototypeOf(target)));
  }

  /**
   * Recursive merge properties from sources with base and return new result object
   */
  static mergeDeep<T extends IObject>(base: T | null, ...sources: IObject[]): T {
    return sources.reduce((result: T, source: IObject) => {
      if (!source) {
        return result;
      }

      Object.keys(source).forEach(key => {
        const res = result?.[key];
        const src = source[key];

        if (Array.isArray(res) && Array.isArray(src)) {
          // @ts-ignore
          result[key] = res.concat(...src);
        } else if (this.isObject(res) && this.isObject(src) && res.constructor.name === src.constructor.name) {
          // @ts-ignore
          result[key] = this.mergeDeep(res, src);
        } else if (typeof res === 'undefined' || typeof src !== 'undefined') {
          // @ts-ignore
          result[key] = src;
        }
      });

      return result;
    }, <T> Object.assign(Object.create(Object.getPrototypeOf(base)), base));
  }
}
