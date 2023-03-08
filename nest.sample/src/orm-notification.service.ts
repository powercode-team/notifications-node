import { Injectable } from '@nestjs/common';
import {
  INotificationEntity,
  INotificationQueueEntity,
  IOptions,
  NotificationService as BaseService,
  UNREAD_STATUSES,
} from '@node-notifications/core';
import { FindWhere, TypeOrmStorage } from '@node-notifications/storage-typeorm-0.2';
import { In } from 'typeorm';

/**
 * Sample NotificationService with Typeorm Storage for save Queue / History
 */
@Injectable()
export class OrmNotificationService extends BaseService<TypeOrmStorage> {
  /**
   * Find queue notification by "transport"
   */
  findQueueByTransport(transport: string, options?: IOptions): Promise<INotificationQueueEntity[]> {
    return this.storage.queueRepo.findByTransport(transport, options);
  }

  /**
   * Find Notification (history) by "recipient"
   */
  findByRecipient(userId: string, transports?: string[], withRead = false, options?: IOptions): Promise<INotificationEntity[]> {
    const where: FindWhere<INotificationEntity<string, string>> = {};
    if (transports && transports.length > 0) {
      where.transport = In(transports);
    }
    if (!withRead) {
      where.status = In(UNREAD_STATUSES);
    }

    return this.storage.notificationRepo?.findByRecipient(userId, where, options) ?? Promise.resolve([]);
  }

  /**
   * Find "history" notification by "transport"
   */
  async findByTransport(transport: string | string[], options?: IOptions): Promise<INotificationEntity[]> {
    return this.storage.notificationRepo?.findByTransport(transport, options) ?? [];
  }
}
