import { INotificationEntity } from '../../interface';
import { PROCESSING_STATUSES } from '../../type';
import { BaseStorage } from '../base.storage';
import { MemoryNotificationRepository, MemoryQueueRepository } from './repository';

export class MemoryStorage extends BaseStorage<MemoryQueueRepository, MemoryNotificationRepository> {
  protected timer: NodeJS.Timer;
  protected historyClearInterval = 30; // in seconds

  /**
   * @param historyTTL In seconds
   */
  async initialize(historyTTL?: number): Promise<MemoryStorage> {
    this._queueRepo = new MemoryQueueRepository();

    if (historyTTL && historyTTL > 0) {
      this.enableHistory(historyTTL);
    } else {
      this.disableHistory();
    }

    return this;
  }

  async destroy(): Promise<void> {
    this.disableHistory();
  }

  protected enableHistory(historyTTL: number) {
    if (historyTTL < 0) {
      throw new Error(`'historyTTL' should be positive: ${historyTTL}`);
    }
    if (this.timer) {
      clearInterval(this.timer);
    }

    this._notificationRepo = new MemoryNotificationRepository();

    this.timer = setInterval(() => {
      if (this.notificationRepo) {
        const ttl = new Date(Math.round((new Date()).getTime() / 1000 - historyTTL) * 1000);
        this.notificationRepo.deleteBy((item: INotificationEntity) =>
          item.sentAt && item.sentAt <= ttl && !PROCESSING_STATUSES.includes(item.status),
        ).then();
      }
    }, this.historyClearInterval * 1000);
  }

  protected disableHistory() {
    this._notificationRepo = null;
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
