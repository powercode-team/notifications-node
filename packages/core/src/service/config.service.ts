import EventEmitter from 'events';
import { ObjectHelper, StringHelper } from '../helper';
import { IConfig, IConfigService, IObject } from '../interface';
import { DummyErrorHandler } from './error-handler';
import { DummyBucketService } from './leaky-bucket';

export class ConfigService implements IConfigService {
  private readonly config: IConfig;

  constructor(config?: Partial<IConfig>) {
    this.config = <IConfig> ObjectHelper.mergeDeep({
      eventEmitter: new EventEmitter(),
      errorHandler: new DummyErrorHandler(),
      leakyBucket: new DummyBucketService(),
      processingInterval: 3,
    }, config || {});
  }

  get<T>(name: keyof IConfig, from?: IObject): T {
    let value = from?.[`get${StringHelper.capitalize(name)}`] ?? from?.[name] ?? undefined;
    const defValue: T | undefined = <T> this.config[name] ?? undefined;

    if (typeof value === 'undefined' && typeof defValue === 'undefined') {
      throw new Error(`Unknown configuration: '${name}'`);
    }
    if (typeof value === 'function') {
      value = value();
    }

    if (ObjectHelper.isObject(value) && ObjectHelper.isObject(defValue)) {
      return <T> ObjectHelper.mergeDeep(<IObject> defValue, value);
    }

    return value ?? defValue;
  }
}
