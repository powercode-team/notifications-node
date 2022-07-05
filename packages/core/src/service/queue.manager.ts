import { NotificationService } from './notification.service';

export class NotificationQueueManager {
  protected readonly timers: Map<string, NodeJS.Timer> = new Map<string, NodeJS.Timer>;

  constructor(
    protected readonly service: NotificationService,
  ) {}

  /**
   * Start queue processing
   */
  queueStart(transportAlias?: string | string[]): NotificationQueueManager {
    this.service.getTransports(transportAlias).forEach(transport => {
      const timer = this.timers.get(transport.alias);
      if (!timer) {
        const processingInterval: number = this.service.getProcessingInterval(transport);
        if (processingInterval < 1) {
          throw new Error(`Error transport (${transport.alias}) processingInterval: '${processingInterval}'`);
        }

        this.timers.set(transport.alias, setInterval(() => this.service.processQueue(transport), processingInterval * 1000));
      }
    });

    return this;
  }

  /**
   * Stop queue processing
   */
  queueStop(transportAlias?: string | string[]): NotificationQueueManager {
    switch (true) {
      case typeof transportAlias === 'string':
        this.clearTimer(<string> transportAlias);
        break;
      case Array.isArray(transportAlias):
        (<string[]> transportAlias).forEach(alias => this.clearTimer(alias));
        break;
      default:
        this.timers.forEach((timer: NodeJS.Timer, key: string) => {
          clearInterval(timer);
          this.timers.delete(key);
        });
        break;
    }

    return this;
  }

  protected clearTimer(alias: string) {
    if (this.timers.has(alias)) {
      clearInterval(this.timers.get(alias));
      this.timers.delete(alias);
    }
  }
}
