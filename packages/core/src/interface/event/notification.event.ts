import { INotificationQueueEntity } from '../storage';

export interface INotificationEvent {
  /** Transport Alias */
  transport: string;

  /** IQueueEntity Item */
  item: INotificationQueueEntity;
}
