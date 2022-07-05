import { IQueueEntity } from '../storage';

export interface IQueueProcessingEvent {
  /** Transport */
  transport: string;

  /** IQueueEntity collection */
  items: IQueueEntity[];
}
