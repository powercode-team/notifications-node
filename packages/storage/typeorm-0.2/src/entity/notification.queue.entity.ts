import { PK } from '@node-notifications/core';
import { Column, Entity } from 'typeorm';
import { NotificationHistoryEntity } from './notification.history.entity';

@Entity('notification_queue')
export class NotificationQueueEntity<Id extends PK = PK, UserId extends PK = PK>
  extends NotificationHistoryEntity<Id, UserId> {

  /** Next try to send */
  @Column('timestamptz', { name: 'next_send', nullable: true, default: null })
  nextSend: Date | null = null;

  /** In processing */
  @Column('boolean', { name: 'in_process', default: false })
  inProcess: boolean = false;
}
