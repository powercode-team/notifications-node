import { INotificationQueueEntity } from '../../../interface';
import { MemoryNotificationEntity } from './notification.history.entity';

export class MemoryNotificationQueueEntity extends MemoryNotificationEntity implements INotificationQueueEntity<string> {
  /** Next try to send */
  nextSend: Date | null = null;

  /** In processing */
  inProcess: boolean = false;
}
