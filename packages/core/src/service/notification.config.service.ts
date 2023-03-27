import EventEmitter from 'events';
import { ObjectHelper, StringHelper } from '../helper';
import { INotificationConfig, INotificationConfigService, IObject } from '../interface';
import { DummyErrorHandler } from './error-handler';
import { DummyBucketService } from './leaky-bucket';

export class NotificationConfigService implements INotificationConfigService {
  private readonly config: INotificationConfig;

  constructor(config?: Partial<INotificationConfig>) {
    this.config = <INotificationConfig> ObjectHelper.assignDeep({
      eventEmitter: new EventEmitter(),
      errorHandler: new DummyErrorHandler(),
      leakyBucket: new DummyBucketService(),
      processingInterval: 3,
    }, config || {});
  }

  get<T>(name: keyof INotificationConfig, from?: IObject): T {
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
