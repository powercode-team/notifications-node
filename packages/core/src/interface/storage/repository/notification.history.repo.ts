import { PK } from '../../../type';
import { Criteria } from '../../common';
import { INotificationHistoryEntity } from '../entity';

export interface INotificationHistoryRepo<Id extends PK = PK, UserId extends PK = PK> {
  createHistory(data: Partial<INotificationHistoryEntity>): Promise<INotificationHistoryEntity>;

  updateHistory(id: Id, data: Partial<INotificationHistoryEntity>): Promise<INotificationHistoryEntity>;

  markAsRead(criteria: Criteria<Id>): Promise<number>;
}
