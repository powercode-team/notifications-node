import { ObjectHelper, StringHelper } from '../helper';
import { IObject, ITransportConfig, ITransportConfigService } from '../interface';
import { DummyBucketService } from './leaky-bucket';
import { DummyResendStrategy } from './resend-strategy';

export class TransportConfigService implements ITransportConfigService {
  private readonly config: ITransportConfig;

  constructor(config?: Partial<ITransportConfig>) {
    // Default config
    this.config = <ITransportConfig> ObjectHelper.assignDeep({
      leakyBucket: new DummyBucketService(),
      resendStrategy: new DummyResendStrategy(),
      processingInterval: 10,
    }, config || {});
  }

  get<T>(name: keyof ITransportConfig, from?: IObject): T {
    let value = from?.[`get${ StringHelper.capitalize(name) }`] ?? from?.[name] ?? undefined;
    const defValue: T | undefined = <T> this.config[name] ?? undefined;

    if (typeof value === 'undefined' && typeof defValue === 'undefined') {
      throw new Error(`Unknown configuration: '${ name }'`);
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
