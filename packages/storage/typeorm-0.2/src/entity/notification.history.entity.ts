import { PK } from '@node-notifications/core';
import { Entity } from 'typeorm';
import { NotificationBaseEntity } from './notification.base.entity';

@Entity('notification_history')
export class NotificationHistoryEntity<Id extends PK = PK, UserId extends PK = PK>
  extends NotificationBaseEntity<Id, UserId> {
}
