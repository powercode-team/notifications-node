import { ILeakyBucketService } from '../../interface';

export class DummyBucketService implements ILeakyBucketService {
  calcLimit(transport: string): Promise<number | undefined> {
    return Promise.resolve(undefined);
  }
}
