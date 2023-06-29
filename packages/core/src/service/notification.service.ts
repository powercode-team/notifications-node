import EventEmitter from 'events';
import { ObjectHelper } from '../helper';
import {
  Criteria,
  IBatchNotification,
  IEventEmitter,
  ILeakyBucketService,
  INotificationConfig,
  INotificationHistoryRepo,
  INotificationQueueEntity,
  INotificationQueueRepo,
  INotificationUser,
  IResendStrategy,
  IResponse,
  ITransport,
  ITransportCollection,
  ITransportConfig,
  ITransportConfigService,
  ITransportParams,
} from '../interface';
import { INotificationEvent } from '../interface/event/notification.event';
import {
  NOTIFICATION_CREATED,
  NOTIFICATION_PROCESSED,
  NOTIFICATION_PROCESSING,
  NotificationStatusEnum,
  PK,
  PROCESSING_STATUSES,
} from '../type';
import { TransportConfigService } from './transport-config.service';

export class NotificationService {
  readonly isMonoRepo: boolean;

  protected readonly historyRepo: INotificationHistoryRepo;
  protected readonly queueRepo: INotificationQueueRepo;
  protected readonly transports: ITransportCollection;
  protected readonly transportConfig: ITransportConfigService;
  protected readonly eventEmitter: IEventEmitter;

  constructor(config: INotificationConfig) {
    this.historyRepo = config.historyRepo;
    this.queueRepo = config.queueRepo;

    // @ts-ignore
    this.isMonoRepo = this.historyRepo === this.queueRepo;

    this.transports = config.transports;
    this.transportConfig = new TransportConfigService(config.transportConfig);

    this.eventEmitter = config.eventEmitter ?? new EventEmitter();
  }

  getEventEmitter<EventEmitter extends IEventEmitter = IEventEmitter>(): EventEmitter {
    return this.eventEmitter as EventEmitter;
  }

  getTransportAliases(): string[] {
    return Object.getOwnPropertyNames(this.transports);
  }

  getTransport<Transport extends ITransport = ITransport>(alias: string): Transport {
    const transport = this.transports[alias];
    if (!transport) {
      throw new Error(`Unknown transport: '${ alias }'`);
    }
    return transport as Transport;
  }

  getTransportConfig<T>(name: keyof ITransportConfig, transport: string | ITransport): T {
    if (typeof transport === 'string') {
      transport = this.getTransport(transport);
    }

    return this.transportConfig.get<T>(name, transport.config);
  }

  /**
   * Mark Notification "as read"
   */
  markAsRead<Id extends PK = PK>(criteria: Criteria<Id>): Promise<number | undefined> {
    return Promise.resolve(this.historyRepo.markAsRead(criteria));
  }

  /**
   * Creates a Notification and queues it or force sent it by certain transports
   */
  async send(notification: IBatchNotification, transports: ITransportParams | string[]): Promise<INotificationQueueEntity[]> {
    if (ObjectHelper.isEmpty(transports)) {
      return [];
    }

    const queue: INotificationQueueEntity[] = [];
    const now = new Date();

    const transportAliases: string[] = (Array.isArray(transports) ? transports : Object.getOwnPropertyNames(transports));
    let recipients: INotificationUser[] = Array.isArray(notification.recipients) ? notification.recipients : [notification.recipients];
    recipients = recipients.filter((item, ind) => recipients.findIndex(({ id }) => id == item.id) === ind);

    for (const transport of transportAliases) {
      try {
        const dataProvider = this.getTransport(transport).dataProvider;
        const transportParams = ObjectHelper.value(transports, transport);

        for (const recipient of recipients) {
          try {
            // Add to Queue
            const queueEntity = await this.queueRepo.addToQueue({
              status: NotificationStatusEnum.NEW,
              recipient,
              transport,
              transportData: await dataProvider.prepareTransportData({ ...notification, recipient }, transportParams),
              sender: notification.sender,
              nextSend: now,
              inProcess: true,
            });

            this.eventEmitter.emit(NOTIFICATION_CREATED, <INotificationEvent> {
              transport: transport,
              item: queueEntity,
            });

            if (queueEntity.inProcess) {
              this.processQueueItem(queueEntity).then();
            }

            queue.push(queueEntity);
          } catch (e) {
            console.error(e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    return queue;
  }

  /**
   * Process Transport Queue
   */
  process(...transports: string[]): void {
    if (!transports.length) {
      transports = this.getTransportAliases();
    }

    transports.forEach(async transport => {
      // Leaky Bucket
      const leakyBucket = this.getTransportConfig<ILeakyBucketService>('leakyBucket', transport);
      const limit = await leakyBucket.calcLimit(transport);
      if (limit === 0) {
        return;
      }

      // Processing
      const queue = await this.queueRepo.findForProcessing(transport, limit);
      if (!queue.length) {
        return;
      }

      for (const item of queue) {
        await this.processQueueItem(item);
      }
    });
  }

  /**
   * Process a particular IQueueEntity
   */
  async processQueueItem(queueEntity: INotificationQueueEntity): Promise<INotificationQueueEntity> {
    if (!queueEntity.inProcess || !PROCESSING_STATUSES.includes(queueEntity.status)) {
      console.warn(
        `Unprocessed queue (#${ queueEntity.id }), inProcess: ${ queueEntity.inProcess }, status: '${ queueEntity.status }'.\n`
        + `Only statuses '${ PROCESSING_STATUSES.join('\',\'') }' with attribute inProcess = true can be processed.`,
      );
      return queueEntity;
    }

    // Processing
    try {
      queueEntity.sentAt = new Date(Math.floor((new Date()).getTime() / 1000) * 1000);

      this.eventEmitter.emit(NOTIFICATION_PROCESSING, <INotificationEvent> {
        transport: queueEntity.transport,
        item: queueEntity,
      });

      const transport = this.getTransport(queueEntity.transport);
      let response: IResponse;

      if (NotificationStatusEnum.WAIT === queueEntity.status) {
        if (!queueEntity.transportResponse) {
          throw new Error(
            `Unknown 'transportResponse' for Notification (id: ${ queueEntity.id }) with status '${ queueEntity.status }'`,
          );
        }
        response = await transport.checkStatus(queueEntity.transportResponse);
      } else {
        queueEntity.sentAttempts++;
        response = await transport.send(queueEntity.transportData);
      }

      // Process Response
      queueEntity = await this.processResponse(queueEntity, response);

      this.eventEmitter.emit(NOTIFICATION_PROCESSED, <INotificationEvent> {
        transport: queueEntity.transport,
        item: queueEntity,
      });

    } catch (error) {
      console.error(error instanceof Error ? error.stack : 'Unknown Error');
      return queueEntity;
    }

    return queueEntity;
  }

  protected async processResponse(queueEntity: INotificationQueueEntity, response: IResponse): Promise<INotificationQueueEntity> {
    queueEntity.status = response.status;
    queueEntity.transportResponse = response.response;

    // Error Processing
    queueEntity.nextSend = null;

    if (NotificationStatusEnum.ERROR === queueEntity.status) {
      const transport = this.getTransport(queueEntity.transport);

      const resendStrategy = this.getTransportConfig<IResendStrategy>('resendStrategy', transport);
      const nextSend = resendStrategy.calcNextSend(queueEntity.sentAttempts, queueEntity.sentAt!);
      if (nextSend) {
        queueEntity.nextSend = nextSend;
      } else {
        queueEntity.status = NotificationStatusEnum.FAILED;
      }
    }

    // Update Queue
    queueEntity.inProcess = false;
    queueEntity = await this.queueRepo.updateQueue(queueEntity.id, queueEntity);

    if (!PROCESSING_STATUSES.includes(queueEntity.status)) {
      const { id, nextSend, inProcess, ...notificationData } = queueEntity;

      if (this.isMonoRepo) {
        // Update History
        await this.historyRepo.updateHistory(id, notificationData);
      } else {
        // Create History
        await this.historyRepo.createHistory(notificationData);

        // Delete From Queue
        this.queueRepo.deleteFromQueue({ id }).then();
      }
    }

    return queueEntity;
  }
}
