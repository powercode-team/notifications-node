import { PrimaryKey } from '../../../type';
import { IQueueEntity } from '../entity';
import { IBaseRepository } from './base.repository';

export interface IQueueRepository<ID extends PrimaryKey = PrimaryKey> extends IBaseRepository<IQueueEntity<ID>, ID> {
  /**
   * Find QueueEntity ready for sending;
   *
   * Must set IQueueEntity::inProcess attribute to "true"
   */
  findForProcessing(transport: string, limit?: number): Promise<IQueueEntity<ID>[]>;
}
