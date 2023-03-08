import { Injectable } from '@nestjs/common';
import {
  INotificationEntity,
  INotificationQueueEntity,
  IOptions,
  MemoryStorage,
  NotificationService as BaseService,
} from '@node-notifications/core';

/**
 * Sample NotificationService with InMemory Storage for save Queue / History
 */
@Injectable()
export class InMemoryNotificationService extends BaseService<MemoryStorage> {
  /**
   * Find queue notification by "transport"
   */
  findQueueByTransport(transport: string, options?: IOptions): Promise<INotificationQueueEntity[]> {
    return this.storage.queueRepo.findByTransport(transport, options);
  }

  /**
   * Find "history" notification by "transport"
   */
  async findByTransport(transport: string | string[], options?: IOptions): Promise<INotificationEntity[]> {
    return this.storage.notificationRepo?.findByTransport(transport, options) ?? [];
  }
}
