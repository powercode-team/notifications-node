import { Injectable } from '@nestjs/common';
import {
  INotificationEntity,
  IOptions,
  IQueueEntity,
  ITransport,
  NotificationService as BaseService,
  UNREAD_STATUSES,
} from '@notifications-system/core';
import { FindWhere, TypeormStorage } from '@notifications-system/storage-typeorm-0.2';
import { In } from 'typeorm';

/**
 * Sample NotificationService with Typeorm Storage for save Queue / History
 */
@Injectable()
export class NotificationService extends BaseService<TypeormStorage> {
  /**
   * Find Notification (history) by "recipient"
   */
  async findByRecipient(userId: string, transports?: ITransport[], withRead = false, options?: IOptions)
    : Promise<INotificationEntity<string, string>[]> {

    const where: FindWhere<INotificationEntity<string, string>> = {};
    if (transports && transports.length > 0) {
      where.transport = In(transports);
    }
    if (!withRead) {
      where.status = In(UNREAD_STATUSES);
    }

    return this.storage.notificationRepo?.findByRecipient(userId, where, options) ?? [];
  }

  /**
   * Find queue notification by "transport"
   */
  findQueueByTransport(transport: string, options?: IOptions): Promise<IQueueEntity[]> {
    return this.storage.queueRepo.findByTransport(transport, options);
  }

  /**
   * Find "history" notification by "transport"
   */
  async findByTransport(transport: string | string[], options?: IOptions): Promise<INotificationEntity<string, string>[]> {
    return this.storage.notificationRepo?.findByTransport(transport, options) ?? [];
  }
}
