import { NotificationStatusEnum } from '../../../type';

export interface ILeakyBucketEntity {
  /** Transport Alias */
  transport: string;

  /** Notification Status */
  status: NotificationStatusEnum;

  /** Sent At */
  sentAt: Date | null;
}
