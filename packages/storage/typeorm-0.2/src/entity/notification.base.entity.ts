import { INotificationHistoryEntity, INotificationUser, IObject, NotificationStatusEnum, PK } from '@node-notifications/core';
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class NotificationBaseEntity<Id extends PK = PK, UserId extends PK = PK>
  implements INotificationHistoryEntity<Id, UserId> {

  /** Primary key */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: Id;

  /** Notification status */
  @Column('enum', {
    enumName: 'notification_status_enum',
    enum: NotificationStatusEnum,
  })
  status: NotificationStatusEnum;

  /** Recipient */
  @Column({ type: 'varchar', name: 'recipient_id', length: 40 })
  recipientId: UserId;

  @Column({ type: 'varchar', name: 'recipient_type', nullable: true, default: null, length: 20 })
  recipientType?: string;

  /** Sender */
  @Column({ type: 'varchar', name: 'sender_id', nullable: true, default: null, length: 40 })
  senderId?: UserId;

  @Column({ type: 'varchar', name: 'sender_type', nullable: true, default: null, length: 20 })
  senderType?: string;

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

  /** Recipient */

  get recipient(): INotificationUser<UserId> {
    return {
      id: this.recipientId,
      type: this.recipientType,
    };
  }

  set recipient(recipient: INotificationUser<UserId>) {
    this.recipientId = recipient.id;
    this.recipientType = recipient.type;
  }

  /** Sender */

  get sender(): INotificationUser<UserId> | undefined {
    return this.senderId ? {
      id: this.senderId,
      type: this.senderType,
    } : undefined;
  }

  set sender(sender: INotificationUser<UserId> | undefined) {
    this.senderId = sender?.id;
    this.senderType = sender?.type;
  }
}
