"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notifications2022080101001 = void 0;
const core_1 = require("@notifications-system/core");
const typeorm_1 = require("typeorm");
const NOTIFICATION_NAME = 'notifications';
const QUEUE_NAME = 'queue';
class Notifications2022080101001 {
    async up(queryRunner) {
        const baseColumns = [
            {
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                default: 'uuid_generate_v4()',
            },
            {
                name: 'status',
                type: 'enum',
                enumName: 'notification_status_enum',
                enum: Object.values(core_1.NotificationStatusEnum).filter(val => isNaN(Number(val))),
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
        const notificationColumns = [...baseColumns];
        notificationColumns.push({
            name: 'recipient_id',
            type: 'uuid',
            isNullable: true,
        }, {
            name: 'sender_id',
            type: 'uuid',
            isNullable: true,
        });
        await queryRunner.createTable(new typeorm_1.Table({
            name: NOTIFICATION_NAME,
            columns: notificationColumns,
        }), true);
        const queueColumns = [...baseColumns];
        queueColumns[1].default = '\'NEW\'::notification_status_enum';
        queueColumns.push({
            name: 'next_send',
            type: 'timestamp with time zone',
            isNullable: true,
        }, {
            name: 'in_process',
            type: 'boolean',
        }, {
            name: 'notification_id',
            type: 'uuid',
            isNullable: true,
        });
        await queryRunner.createTable(new typeorm_1.Table({
            name: QUEUE_NAME,
            columns: queueColumns,
        }), true);
        await queryRunner.createUniqueConstraint(QUEUE_NAME, new typeorm_1.TableUnique({
            name: 'UQ_QUEUE_NOTIFICATION',
            columnNames: ['notification_id'],
        }));
        await queryRunner.createForeignKey(QUEUE_NAME, new typeorm_1.TableForeignKey({
            name: 'FK_QUEUE_NOTIFICATION',
            columnNames: ['notification_id'],
            referencedColumnNames: ['id'],
            referencedTableName: NOTIFICATION_NAME,
            onDelete: "CASCADE",
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable(QUEUE_NAME, true);
        await queryRunner.dropTable(NOTIFICATION_NAME, true);
        await queryRunner.query('DROP TYPE "notification_status_enum"');
    }
}
exports.Notifications2022080101001 = Notifications2022080101001;
//# sourceMappingURL=2022080101001-notification.js.map
