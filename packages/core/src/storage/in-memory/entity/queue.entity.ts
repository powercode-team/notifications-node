import { ILeakyBucketEntity, INotificationEntity, IQueueEntity } from '../../../interface';
import { NotificationBase } from './notification.base';

export class QueueEntity extends NotificationBase implements IQueueEntity<string>, Omit<ILeakyBucketEntity, 'sentAt'> {
  /** Related Notification */
  notification: INotificationEntity<string> | null;

  /** Next try to send */
  nextSend: Date | null = null;

  /** In processing */
  inProcess: boolean;
}
