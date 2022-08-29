import { Injectable } from '@nestjs/common';
import { INotificationEntity, IOptions, IQueueEntity, MemoryStorage, NotificationService as BaseService } from '@notifications-system/core';

/**
 * Sample NotificationService with InMemory Storage for save Queue / History
 */
@Injectable()
export class InMemoryNotification extends BaseService<MemoryStorage> {
  /**
   * Find "history" notification by "transport"
   */
  async findByTransport(transport: string | string[], options?: IOptions): Promise<INotificationEntity<string, string>[]> {
    return this.storage.notificationRepo?.findByTransport(transport, options) ?? [];
  }

  /**
   * Find queue notification by "transport"
   */
  findQueueByTransport(transport: string, options?: IOptions): Promise<IQueueEntity[]> {
    return this.storage.queueRepo.findByTransport(transport, options);
  }
}
