import { ILeakyBucketEntity, ILeakyBucketService } from '../../interface';

export class DummyBucketService implements ILeakyBucketService {
  store(data: ILeakyBucketEntity): Promise<ILeakyBucketEntity | null> {
    return Promise.resolve(null);
  }

  clear(transport: string): Promise<number> {
    return Promise.resolve(0);
  }

  calcLimit(transport: string): Promise<number | undefined> {
    return Promise.resolve(undefined);
  }
}
