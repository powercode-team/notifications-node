import { INotificationQueueRepository, INotificationRepository } from '../storage';

export interface INotificationStorage {
  /**
   * Queue Repository
   */
  queueRepo: INotificationQueueRepository;

  /**
   * Notification (history) Repository
   */
  notificationRepo: INotificationRepository | null;
}
