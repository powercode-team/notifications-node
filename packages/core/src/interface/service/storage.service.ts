import { INotificationRepository, IQueueRepository } from '../storage';

export interface IStorageService {
  /**
   * Queue Repository
   */
  queueRepo: IQueueRepository;

  /**
   * Notification (history) Repository
   */
  notificationRepo: INotificationRepository | null;
}
