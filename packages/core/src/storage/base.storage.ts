import { INotificationQueueRepository, INotificationRepository, INotificationStorage } from '../interface';

export abstract class BaseStorage<QueueRepo extends INotificationQueueRepository, NotificationRepo extends INotificationRepository>
  implements INotificationStorage {

  protected _queueRepo: QueueRepo | null = null;
  protected _notificationRepo: NotificationRepo | null = null;

  /**
   * Initialize Storage; Establish necessary connections; Prepare Repositories;
   */
  abstract initialize(options?: unknown): Promise<BaseStorage<QueueRepo, NotificationRepo>>;

  /**
   * Cleanup Storage; Close opened connections;
   */
  abstract destroy(): Promise<void>;

  /**
   * Queue Repository
   */
  get queueRepo(): QueueRepo {
    if (!this._queueRepo) {
      throw new Error(`Uninitialized ${this.constructor.name}. Please call ${this.constructor.name}::initialize()`);
    }
    return this._queueRepo;
  }

  /**
   * Notification (history) Repository
   */
  get notificationRepo(): NotificationRepo | null {
    return this._notificationRepo;
  }
}
