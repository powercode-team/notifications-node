import { INotificationEntity, PrimaryKey } from '@notifications-system/core';
import { Column, Entity } from 'typeorm';
import { NotificationBaseEntity } from './notification.base.entity';

@Entity('notifications')
export class NotificationEntity<USER_ID extends PrimaryKey = PrimaryKey> extends NotificationBaseEntity implements INotificationEntity<string, USER_ID> {
  /** Recipient */
  @Column('uuid', { name: 'recipient_id', nullable: true })
  recipientId?: USER_ID;

  /** Sender */
  @Column('uuid', { name: 'sender_id', nullable: true, default: null })
  senderId?: USER_ID;
}
