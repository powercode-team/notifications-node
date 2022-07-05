import { ILeakyBucketEntity } from './leaky-bucket.entity';

export interface ILeakyBucketRepository {
  /** Store leaky-bucket data */
  leakyBucketPut(data: ILeakyBucketEntity): Promise<ILeakyBucketEntity | null>;

  /**
   * Count sent from the "date";
   *
   * Sample filter (item: ILeakyBucketEntity):
   *  item.transport === transport && item.sentAt >= date
   */
  leakyBucketCount(transport: string, date: Date): Promise<number>;

  /**
   * Remove sent to the "date"
   *
   * Sample filter (item: ILeakyBucketEntity):
   *  item.transport === transport && item.sentAt < date
   */
  leakyBucketClear(transport: string, date: Date): Promise<number>;
}
