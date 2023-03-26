import { ILeakyBucketService } from '../../interface';

interface ILeakyBucketItem {
  transport: string,
  sentAt: Date
}

export class LeakyBucketService implements ILeakyBucketService {
  protected items: ILeakyBucketItem[] = [];

  constructor(
    protected readonly limit?: number,
    protected readonly interval: number = 0, // in seconds
  ) {}

  async calcLimit(transport: string): Promise<number | undefined> {
    if (!this.limit || this.limit <= 0) {
      return undefined;
    }
    if (this.interval <= 0) {
      return this.limit;
    }

    const date = this.calcDate();

    this.clear(transport, date);
    const count: number = this.limit - this.count(transport, date);
    this.put({ transport, sentAt: new Date() }, count);

    return count > 0 ? count : 0;
  }

  protected count(transport: string, date: Date): number {
    return this.items.filter((item: ILeakyBucketItem) => item.transport === transport && item.sentAt >= date).length;
  }

  protected put(data: ILeakyBucketItem, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this.items.push(data);
    }
  }

  protected clear(transport: string, date: Date): void {
    let ind: number;
    while ((ind = this.items.findIndex((item: ILeakyBucketItem) => item.transport === transport && item.sentAt < date)) >= 0) {
      this.items.splice(ind, 1);
    }
  }

  protected calcDate(): Date {
    return new Date(Math.ceil((new Date()).getTime() / 1000 - this.interval) * 1000);
  }
}
