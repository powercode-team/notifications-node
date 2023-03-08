import { INotificationEntity } from '@node-notifications/core';
import { Column, Entity } from 'typeorm';
import { NotificationBaseEntity } from './notification.base.entity';

@Entity('notifications')
export class NotificationEntity extends NotificationBaseEntity implements INotificationEntity<number, string> {
  /** Recipient */
  @Column({ type: 'varchar', name: 'recipient_type', nullable: true, default: null, length: 20 })
  recipientType?: string;

  @Column({ type: 'varchar', name: 'recipient_id', nullable: true, default: null, length: 40 })
  recipientId?: string;

  /** Sender */
  @Column({ type: 'varchar', name: 'sender_type', nullable: true, default: null, length: 20 })
  senderType?: string;

  @Column({ type: 'varchar', name: 'sender_id', nullable: true, default: null, length: 40 })
  senderId?: string;
}
