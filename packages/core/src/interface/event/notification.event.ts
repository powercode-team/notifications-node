import { IQueueEntity } from '../storage';

export interface INotificationEvent {
  /** Transport */
  transport: string;

  /** IQueueEntity item */
  item: IQueueEntity;
}
