export enum NotificationStatusEnum {
  NEW = 'NEW',
  WAIT = 'WAIT',
  SENT = 'SENT',
  READ = 'READ',
  ERROR = 'ERROR',
  FAILED = 'FAILED',
}

export const UNREAD_STATUSES = Object.values(NotificationStatusEnum).filter(val => val !== NotificationStatusEnum.READ);

export const PROCESSING_STATUSES: NotificationStatusEnum[] = [
  NotificationStatusEnum.NEW,
  NotificationStatusEnum.WAIT,
  NotificationStatusEnum.ERROR,
];
