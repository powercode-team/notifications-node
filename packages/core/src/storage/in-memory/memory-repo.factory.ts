import { INotificationHistoryEntity, INotificationHistoryRepo, INotificationQueueRepo } from '../../interface';
import { PROCESSING_STATUSES } from '../../type';
import { MemoryNotificationEntity } from './entity';
import { MemoryDriver } from './memory.driver';
import { MemoryNotificationHistoryRepo, MemoryNotificationQueueRepo } from './repository';

export class InMemoryRepoFactory {
  protected timer: NodeJS.Timer;
  protected historyClearInterval = 30; // in seconds

  readonly notificationRepo: INotificationHistoryRepo;
  readonly queueRepo: INotificationQueueRepo;

  constructor() {
    this.notificationRepo = new MemoryNotificationHistoryRepo();
    this.queueRepo = new MemoryNotificationQueueRepo();
  }

  /**
   * @param historyTTL In seconds
   */
  async initialize(historyTTL: number = 3600): Promise<InMemoryRepoFactory> {
    this.timer = setInterval(() => {
      const ttl = new Date(Math.round((new Date()).getTime() / 1000 - historyTTL) * 1000);
      MemoryDriver.deleteBy(
        MemoryNotificationEntity.name,
        (item: INotificationHistoryEntity) => item.sentAt && item.sentAt <= ttl && !PROCESSING_STATUSES.includes(item.status),
      );
    }, this.historyClearInterval * 1000);

    return this;
  }
}
