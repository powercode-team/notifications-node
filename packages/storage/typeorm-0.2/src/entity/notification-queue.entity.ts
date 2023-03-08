import { INotificationEntity, INotificationQueueEntity } from '@node-notifications/core';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { NotificationBaseEntity } from './notification.base.entity';
import { NotificationEntity } from './notification.entity';

@Entity('notification_queue')
export class NotificationQueueEntity extends NotificationBaseEntity implements INotificationQueueEntity<number> {
  /** Next try to send */
  @Column('timestamptz', { name: 'next_send', nullable: true, default: null })
  nextSend: Date | null = null;

  /** In processing */
  @Column('boolean', { name: 'in_process', default: false })
  inProcess: boolean = false;

  // Relations

  /** Related Notification */
  @Column({ type: 'bigint', name: 'notification_id', nullable: true, default: null })
  notificationId: number | null;

  @OneToOne(() => NotificationEntity, { nullable: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: INotificationEntity<number> | null;
}
