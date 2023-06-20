import { Injectable } from '@nestjs/common';
import {
  INotificationHistoryEntity,
  INotificationQueueEntity,
  IOptions,
  MemoryNotificationQueueRepo,
  NotificationService as BaseService,
  UNREAD_STATUSES,
} from '@node-notifications/core';
import { NotificationHistoryRepo } from '@node-notifications/storage-typeorm-0.2';
import { FindConditions, FindManyOptions, In } from 'typeorm';

/**
 * Sample NotificationService with Typeorm Storage for save Queue / History
 */
@Injectable()
export class OrmNotificationService extends BaseService {
  protected historyRepo: NotificationHistoryRepo;
  protected queueRepo: MemoryNotificationQueueRepo;

  /**
   * Find Notification (history) by "recipient"
   */
  async findByRecipient(userId: string, transports?: string[], withRead = false, options?: IOptions): Promise<INotificationHistoryEntity[]> {
    const where: FindConditions<INotificationHistoryEntity> = {};
    if (transports && transports.length > 0) {
      where.transport = In(transports);
    }
    if (!withRead) {
      where.status = In(UNREAD_STATUSES);
    }

    return this.historyRepo.find({
      // @ts-ignore
      where: { ...where, recipientId: userId },
      ...this.prepareFindManyOptions(options),
    });
  }

  /**
   * Find History Notification by "transport"
   */
  async findByTransport(transport: string | string[], options?: IOptions): Promise<INotificationHistoryEntity[]> {
    if (transport.length < 1) {
      throw new Error('Undefined transport');
    }
    const where: FindConditions<INotificationHistoryEntity> = {
      transport: typeof transport === 'string' ? transport : transport.length > 1 ? In(transport) : transport[0],
    };

    // @ts-ignore
    return this.historyRepo.find({ where, ...this.prepareFindManyOptions(options) });
  }

  /**
   * Find Queue Notification by "transport"
   */
  async findQueueByTransport(transport: string | string[], options?: IOptions): Promise<INotificationQueueEntity[]> {
    if (transport.length < 1) {
      throw new Error('Undefined transport');
    }

    return this.queueRepo.findBy({
      where: {
        transport: typeof transport === 'string' ? transport : transport.length > 1 ? In(transport) : transport[0],
      },
      ...this.prepareFindManyOptions(options),
    });
  }

  prepareFindManyOptions<Entity>(options?: IOptions): FindManyOptions<Entity> {
    const result: FindManyOptions<Entity> = {};

    if (options?.order) {
      result.order = <any> options.order;
    }

    if (options?.offset) {
      result.skip = options.offset;
    }
    if (options?.limit) {
      result.take = options.limit;
    }

    return result;
  }
}
