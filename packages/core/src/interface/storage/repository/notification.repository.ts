import { PrimaryKey } from '../../../type';
import { INotificationEntity } from '../entity';
import { IBaseRepository } from './base.repository';

export interface INotificationRepository<ID extends PrimaryKey = PrimaryKey, USER_ID extends PrimaryKey = PrimaryKey>
  extends IBaseRepository<INotificationEntity<ID, USER_ID>, ID> {

  markAsRead(id: ID): Promise<INotificationEntity<ID, USER_ID> | null>;
}
