import { INotificationBaseEntity, IObject, NotificationStatusEnum } from '@node-notifications/core';
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Notifications base class
 */
export abstract class NotificationBaseEntity implements INotificationBaseEntity<number> {
  /** Primary key */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** Notification status */
  @Column('enum', {
    enumName: 'notification_status_enum',
    enum: NotificationStatusEnum,
  })
  status: NotificationStatusEnum;

  /** Transport Alias */
  @Column('varchar')
  transport: string;

  /** Transport Data */
  @Column('json', { name: 'transport_data' })
  transportData: IObject;

  /** Transport Response */
  @Column('json', { name: 'transport_response', nullable: true, default: null })
  transportResponse: IObject | null = null;

  /** Sent attempts */
  @Column('int', { name: 'sent_attempts', default: 0 })
  sentAttempts: number = 0;

  /** Sent At */
  @Column('timestamptz', { name: 'sent_at', nullable: true, default: null })
  sentAt: Date | null = null;

  /** Created At */
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}
