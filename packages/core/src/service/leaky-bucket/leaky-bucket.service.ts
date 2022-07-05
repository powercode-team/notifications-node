import { ILeakyBucketEntity, ILeakyBucketRepository, ILeakyBucketService } from '../../interface';
import { LeakyBucketRepository } from '../../storage';

export class LeakyBucketService implements ILeakyBucketService {
  constructor(
    protected readonly limit: number,
    protected readonly interval: number = 0, // in seconds
    protected readonly repo: ILeakyBucketRepository = new LeakyBucketRepository(),
  ) {}

  store(data: ILeakyBucketEntity): Promise<ILeakyBucketEntity | null> {
    if (!this.checkLimit() || !this.checkInterval()) {
      return Promise.resolve(null);
    }

    return this.repo.leakyBucketPut(data);
  }

  clear(transport: string): Promise<number> {
    if (!this.checkLimit() || !this.checkInterval()) {
      return Promise.resolve(0);
    }

    return this.repo.leakyBucketClear(transport, this.calcDate());
  }

  async calcLimit(transport: string): Promise<number | undefined> {
    if (!this.checkLimit()) {
      return undefined;
    }
    if (!this.checkInterval()) {
      return this.limit;
    }

    const result: number = this.limit - (await this.repo.leakyBucketCount(transport, this.calcDate()));

    return result > 0 ? result : 0;
  }

  protected checkLimit(): boolean {
    return this.limit > 0;
  }

  protected checkInterval(): boolean {
    return this.interval > 0;
  }

  protected calcDate(): Date {
    return new Date(Math.ceil((new Date()).getTime() / 1000 - this.interval) * 1000);
  }
}
