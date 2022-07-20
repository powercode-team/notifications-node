import { INotificationEntity, IQueueEntity } from '@notifications-system/core';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { NotificationBaseEntity } from './notification.base.entity';
import { NotificationEntity } from './notification.entity';

@Entity('queue')
export class QueueEntity extends NotificationBaseEntity implements IQueueEntity<string> {
  /** Next try to send */
  @Column('timestamptz', { name: 'next_send', nullable: true, default: null })
  nextSend: Date | null = null;

  /** In processing */
  @Column('boolean', { name: 'in_process' })
  inProcess: boolean;

  // Relations

  /** Related Notification */
  @OneToOne(() => NotificationEntity, { nullable: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: INotificationEntity<string> | null;

  @Column('uuid', { name: 'notification_id', nullable: true, default: null })
  notificationId: string | null;
}
