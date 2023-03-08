import { NotificationStatusEnum } from '@node-notifications/core';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';
import { TableColumnOptions } from 'typeorm/schema-builder/options/TableColumnOptions';

const NOTIFICATION_NAME = 'notifications';
const QUEUE_NAME = 'notification_queue';

export class Notifications2022080101001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const baseColumns: TableColumnOptions[] = [
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

    // Notification (history) Entity

    const notificationColumns = [...baseColumns];
    notificationColumns[0].primaryKeyConstraintName = 'PK_NOTIFICATION';
    notificationColumns.push(
      {
        name: 'recipient_type',
        type: 'varchar',
        isNullable: true,
        default: null,
        length: '20',
      },
      {
        name: 'recipient_id',
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
        name: 'sender_id',
        type: 'varchar',
        isNullable: true,
        default: null,
        length: '40',
      },
    );

    await queryRunner.createTable(
      new Table({
        name: NOTIFICATION_NAME,
        columns: notificationColumns,
      }),
      true,
    );

    // Queue Entity

    const queueColumns = [...baseColumns];
    queueColumns[0].primaryKeyConstraintName = 'PK_QUEUE';
    queueColumns[1].default = '\'NEW\'::notification_status_enum';
    queueColumns.push(
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
      {
        name: 'notification_id',
        type: 'bigint',
        isNullable: true,
      },
    );

    await queryRunner.createTable(
      new Table({
        name: QUEUE_NAME,
        columns: queueColumns,
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      QUEUE_NAME,
      new TableUnique({
        name: 'UQ_QUEUE_NOTIFICATION',
        columnNames: ['notification_id'],
      }),
    );

    await queryRunner.createForeignKey(
      QUEUE_NAME,
      new TableForeignKey({
        name: 'FK_QUEUE_NOTIFICATION',
        columnNames: ['notification_id'],
        referencedColumnNames: ['id'],
        referencedTableName: NOTIFICATION_NAME,
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(QUEUE_NAME, true);
    await queryRunner.dropTable(NOTIFICATION_NAME, true);

    await queryRunner.query('DROP TYPE "notification_status_enum"');
  }
}
