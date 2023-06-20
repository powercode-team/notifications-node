import { PK } from '@node-notifications/core';
import { Entity } from 'typeorm';
import { NotificationQueueEntity } from './notification.queue.entity';

@Entity('notification')
export class NotificationEntity<Id extends PK = PK, UserId extends PK = PK>
  extends NotificationQueueEntity<Id, UserId> {
}
