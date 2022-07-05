import { IObject } from '../interface';

export class ObjectHelper {
  static isObject = (obj: unknown) => obj && typeof obj === 'object' && obj.constructor.name === 'Object';

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
        } else if (this.isObject(res) && this.isObject(src)) {
          // @ts-ignore
          result[key] = this.assignDeep(res, src);
        } else if (typeof src !== 'undefined' || typeof res === 'undefined') {
          // @ts-ignore
          result[key] = src;
        }
      });

      return result;
    }, target ?? {});
  }

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
        } else if (this.isObject(res) && this.isObject(src)) {
          // @ts-ignore
          result[key] = this.mergeDeep(res, src);
        } else if (typeof res === 'undefined' || typeof src !== 'undefined') {
          // @ts-ignore
          result[key] = src;
        }
      });

      return result;
    }, <T> { ...base });
  }
}
