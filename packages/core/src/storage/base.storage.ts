import { INotificationRepository, IQueueRepository, IStorageService } from '../interface';

export abstract class BaseStorage<QUEUE_REPO extends IQueueRepository, NOTIFICATION_REPO extends INotificationRepository>
  implements IStorageService {

  protected _queueRepo: QUEUE_REPO | null = null;
  protected _notificationRepo: NOTIFICATION_REPO | null = null;

  /**
   * Initialize Storage; Establish necessary connections; Prepare Repositories;
   */
  abstract initialize(options?: any): Promise<BaseStorage<QUEUE_REPO, NOTIFICATION_REPO>>;

  /**
   * Cleanup Storage; Close opened connections;
   */
  abstract destroy(): Promise<void>;

  /**
   * Queue Repository
   */
  get queueRepo(): QUEUE_REPO {
    if (!this._queueRepo) {
      throw new Error(`Uninitialized ${this.constructor.name}. Please call ${this.constructor.name}::initialize()`);
    }
    return this._queueRepo;
  }

  /**
   * Notification (history) Repository
   */
  get notificationRepo(): NOTIFICATION_REPO | null {
    return this._notificationRepo;
  }
}
