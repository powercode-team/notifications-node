import { NotificationStatusEnum } from '@node-notifications/core';
import { MigrationInterface, QueryRunner, Table, TableColumnOptions } from 'typeorm';

const HISTORY_NAME = 'notification_history';
const QUEUE_NAME = 'notification_queue';

export class HistoryQueue2022080103001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const historyColumns: TableColumnOptions[] = [
      {
        name: 'id',
        type: 'bigint',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      },
      {
        name: 'status',
        type: 'enum',
        enumName: 'notification_status_enum',
        enum: Object.values(NotificationStatusEnum),
        default: '\'NEW\'::notification_status_enum',
      },
      {
        name: 'recipient_id',
        type: 'varchar',
        length: '40',
      },
      {
        name: 'recipient_type',
        type: 'varchar',
        isNullable: true,
        default: null,
        length: '20',
      },
      {
        name: 'sender_id',
        type: 'varchar',
        isNullable: true,
        default: null,
        length: '40',
      },
      {
        name: 'sender_type',
        type: 'varchar',
        isNullable: true,
        default: null,
        length: '20',
      },
      {
        name: 'transport',
        type: 'varchar',
        length: '50',
      },
      {
        name: 'transport_data',
        type: 'json',
      },
      {
        name: 'transport_response',
        type: 'json',
        isNullable: true,
      },
      {
        name: 'sent_attempts',
        type: 'integer',
        default: 0,
      },
      {
        name: 'sent_at',
        type: 'timestamp with time zone',
        isNullable: true,
      },
      {
        name: 'created_at',
        type: 'timestamp with time zone',
        default: 'now()',
      },
    ];

    const queueColumns: TableColumnOptions[] = [
      ...historyColumns,
      {
        name: 'next_send',
        type: 'timestamp with time zone',
        isNullable: true,
      },
      {
        name: 'in_process',
        type: 'boolean',
        default: false,
      },
    ];

    await queryRunner.createTable(
      new Table({
        name: HISTORY_NAME,
        columns: historyColumns,
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: QUEUE_NAME,
        columns: queueColumns,
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(HISTORY_NAME, true);
    await queryRunner.dropTable(QUEUE_NAME, true);

    await queryRunner.query('DROP TYPE "notification_status_enum"');
  }
}
