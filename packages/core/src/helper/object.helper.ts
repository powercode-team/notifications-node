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

  static assignDeep(target: IObject, ...sources: IObject[]): IObject {
    return sources.reduce((result: IObject, source: IObject) => {
      if (!source) {
        return result;
      }

      Object.keys(source).forEach(key => {
        const res = result[key];
        const src = source[key];

        if (Array.isArray(res) && Array.isArray(src)) {
          // @ts-ignore
          result[key] = res.concat(...src);
        } else if (this.isObject(res) && this.isObject(src)) {
          // @ts-ignore
          result[key] = this.assignDeep(res, src);
        } else if (typeof src !== 'undefined' || typeof res === 'undefined') {
          // @ts-ignore
          result[key] = src;
        }
      });

      return result;
    }, target ?? <IObject> {});
  }

  static mergeDeep(base: IObject | null, ...sources: IObject[]): IObject {
    return sources.reduce((result: IObject, source: IObject) => {
      if (!source) {
        return result;
      }

      Object.keys(source).forEach(key => {
        const res = result?.[key];
        const src = source[key];

        if (Array.isArray(res) && Array.isArray(src)) {
          // @ts-ignore
          result[key] = res.concat(...src);
        } else if (this.isObject(res) && this.isObject(src)) {
          // @ts-ignore
          result[key] = this.mergeDeep(res, src);
        } else if (typeof res === 'undefined' || typeof src !== 'undefined') {
          // @ts-ignore
          result[key] = src;
        }
      });

      return result;
    }, <IObject> { ...base });
  }
}
