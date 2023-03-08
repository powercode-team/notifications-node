import { INotificationQueueEntity } from '../storage';

export interface IQueueProcessingEvent {
  /** Transport */
  transport: string;

  /** IQueueEntity collection */
  items: INotificationQueueEntity[];
}
