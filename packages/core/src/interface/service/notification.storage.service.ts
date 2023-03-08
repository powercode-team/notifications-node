import { INotificationQueueRepository, INotificationRepository } from '../storage';

export interface INotificationStorageService {
  /**
   * Queue Repository
   */
  queueRepo: INotificationQueueRepository;

  /**
   * Notification (history) Repository
   */
  notificationRepo: INotificationRepository | null;
}
