import { ILeakyBucketEntity } from '../../interface';
import { NotificationStatusEnum } from '../../type';

export class LeakyBucketEntity implements ILeakyBucketEntity {
  constructor(
    public transport: string,
    public status: NotificationStatusEnum,
    public sentAt: Date = new Date(),
  ) {}
}
