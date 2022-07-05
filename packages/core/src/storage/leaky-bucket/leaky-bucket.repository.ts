import { ILeakyBucketEntity, ILeakyBucketRepository } from '../../interface';
import { LeakyBucketEntity } from './leaky-bucket.entity';

export class LeakyBucketRepository implements ILeakyBucketRepository {
  protected list: LeakyBucketEntity[] = [];

  leakyBucketPut(data: ILeakyBucketEntity): Promise<ILeakyBucketEntity | null> {
    const entity = new LeakyBucketEntity(data.transport, data.status, data.sentAt || undefined);
    this.list.push(entity);

    return Promise.resolve(entity);
  }

  leakyBucketCount(transport: string, date: Date): Promise<number> {
    const count = this.list.filter((item: ILeakyBucketEntity) => item.transport === transport && item.sentAt && item.sentAt >= date).length;

    return Promise.resolve(count);
  }

  leakyBucketClear(transport: string, date: Date): Promise<number> {
    let ind: number;
    let count: number = 0;

    while ((ind = this.list.findIndex((item: ILeakyBucketEntity) => item.transport === transport && item.sentAt && item.sentAt < date)) >= 0) {
      count++;
      this.list.splice(ind, 1);
    }

    return Promise.resolve(count);
  }
}
