import { ILeakyBucketEntity } from '../../storage';

export interface ILeakyBucketService {
  /** Store leaky-bucket data */
  store(data: ILeakyBucketEntity): Promise<ILeakyBucketEntity | null>;

  /** Clear unnecessary data in storage by transport alias */
  clear(transport: string): Promise<number>;

  /** Count limit by transport alias */
  calcLimit(transport: string): Promise<number | undefined>;
}
