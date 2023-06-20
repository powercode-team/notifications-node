import { INotificationQueueEntity } from '../storage';

export interface INotificationEvent {
  /** Transport Alias */
  transport: string;

  item: INotificationQueueEntity;
}
