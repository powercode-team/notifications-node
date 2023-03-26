import { INotificationEntity, INotificationQueueEntity } from '../../../interface';
import { MemoryNotificationBase } from './notification.base';

export class MemoryQueueEntity extends MemoryNotificationBase implements INotificationQueueEntity<string> {
  /** Related Notification */
  notification: INotificationEntity<string> | null;

  /** Next try to send */
  nextSend: Date | null = null;

  /** In processing */
  inProcess: boolean = false;
}
