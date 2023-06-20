import { NotificationService } from './notification.service';

export class NotificationQueueManager {
  protected readonly timers: Map<string, NodeJS.Timer> = new Map<string, NodeJS.Timer>;

  constructor(
    protected readonly service: NotificationService,
  ) {}

  /**
   * Start queue processing
   */
  start(...transports: string[]): NotificationQueueManager {
    if (!transports.length) {
      transports = this.service.getTransportAliases();
    }

    transports.forEach(transport => {
      const timer = this.timers.get(transport);
      if (!timer) {
        const processingInterval: number = this.service.getTransportConfig('processingInterval', transport);
        if (processingInterval < 1) {
          throw new Error(`Error transport (${ transport }) processingInterval: '${ processingInterval }'`);
        }

        this.timers.set(transport, setInterval(() => this.service.process(transport), processingInterval * 1000));
      }
    });

    return this;
  }

  /**
   * Stop queue processing
   */
  stop(...transports: string[]): NotificationQueueManager {
    if (transports.length > 0) {
      transports.forEach(alias => this.clearTimer(alias));
    } else {
      this.timers.forEach((timer: NodeJS.Timer, key: string) => {
        clearInterval(timer);
        this.timers.delete(key);
      });
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
