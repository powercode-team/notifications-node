import { PK } from '../../../type';
import { INotificationEntity } from '../entity';
import { INotificationBaseRepository } from './notification.base.repository';

export interface INotificationRepository<Id extends PK = PK, UserId extends PK = PK>
  extends INotificationBaseRepository<INotificationEntity<Id, UserId>, Id> {

  markAsRead(id: Id): Promise<INotificationEntity<Id, UserId> | null>;
}
