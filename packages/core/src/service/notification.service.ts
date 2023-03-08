import EventEmitter from 'events';
import { ObjectHelper } from '../helper';
import {
  IConfig,
  IConfigService,
  IErrorHandler,
  ILeakyBucketService,
  INotification,
  INotificationBaseEntity,
  INotificationEntity,
  INotificationQueueEntity,
  INotificationStorageService,
  IResponse,
  ITransport,
  Transports,
} from '../interface';
import { INotificationEvent } from '../interface/event/notification.event';
import { IQueueProcessingEvent } from '../interface/event/queue-processing.event';
import {
  NOTIFICATION_CREATED,
  NOTIFICATION_PROCESSED,
  NotificationStatusEnum,
  PK,
  PROCESSING_STATUSES,
  QUEUE_AFTER_PROCESSING,
  QUEUE_BEFORE_PROCESSING,
} from '../type';
import { ConfigService } from './config.service';

export class NotificationService<Storage extends INotificationStorageService = INotificationStorageService, Notification extends INotification = INotification> {
  protected readonly _storage: Storage;
  protected readonly _transports: Transports;
  protected readonly _config: IConfigService;
  protected readonly _eventEmitter: EventEmitter;

  constructor(
    storage: Storage,
    transports: Transports,
    defaultConfig: Partial<IConfig> | IConfigService = new ConfigService(),
  ) {
    if (ObjectHelper.isEmpty(transports)) {
      throw new Error('Undefined transports');
    }

    this._storage = storage;
    this._transports = transports;

    this._config = ObjectHelper.isObject(defaultConfig) ? new ConfigService(<Partial<IConfig>> defaultConfig) : <IConfigService> defaultConfig;

    this._eventEmitter = this._config.get('eventEmitter');
  }

  get storage(): Storage {
    return this._storage;
  }

  get transports(): ITransport[] {
    return Object.values(this._transports);
  }

  get transportAliases(): string[] {
    return Object.getOwnPropertyNames(this._transports);
  }

  get config(): IConfigService {
    return this._config;
  }

  get eventEmitter(): EventEmitter {
    return this._eventEmitter;
  }

  getTransport(alias: string): ITransport {
    const transport = this._transports[alias];
    if (!transport) {
      throw new Error(`Unknown transport: '${alias}'`);
    }
    return transport;
  }

  getTransportConfig<T>(name: keyof IConfig, transport: string | ITransport): T {
    if (typeof transport === 'string') {
      transport = this.getTransport(transport);
    }

    return this._config.get<T>(name, transport.config);
  }

  /**
   * Mark Notification (history) "as read"
   */
  async markAsRead(id: string): Promise<INotificationEntity | null> {
    return this.storage.notificationRepo?.markAsRead(id) ?? null;
  }

  /**
   * Creates a Notification and queues it or force sent it by certain transports
   */
  async send(data: Notification): Promise<INotificationQueueEntity[]> {
    if (ObjectHelper.isEmpty(data.transports)) {
      return [];
    }

    const nextSend = new Date(Math.floor((new Date()).getTime() / 60000) * 60000);

    const transports = Array.isArray(data.transports) ? data.transports : Object.getOwnPropertyNames(data.transports);

    return <INotificationQueueEntity[]> (await Promise.all(
      transports.map(async (alias: string) => {
        const transportData = await this.getTransport(alias).dataProvider
          .prepareTransportData(data, ObjectHelper.value(data.transports, alias));

        const baseData: Partial<INotificationBaseEntity<PK>> = {
          status: NotificationStatusEnum.NEW,
          transport: alias,
          transportData,
        };

        const notification = (await this.storage.notificationRepo?.createEntity({
          ...baseData,
          recipientId: typeof data.recipient === 'string' ? undefined : data.recipient?.id,
          senderId: typeof data.sender === 'string' ? undefined : data.sender?.id,
        })) ?? null;

        const queueEntity = await this.storage.queueRepo.createEntity({
          ...baseData,
          notification,
          nextSend: nextSend,
        });
        if (!queueEntity) {
          console.error(`Can't insert notification (${alias}) to queue:\n${JSON.stringify(data)}`);
          return null;
        }

        this.eventEmitter.emit(NOTIFICATION_CREATED, <INotificationEvent> {
          transport: alias,
          item: queueEntity,
        });

        return queueEntity;
      }),
    )).filter(entity => !!entity);
  }

  /**
   * Process ITransport Queue
   */
  processQueue(...transports: string[]) {
    if (!transports.length) {
      transports = this.transportAliases;
    }

    transports.forEach(async alias => {
      // Leaky Bucket
      const leakyBucket = this.getTransportConfig<ILeakyBucketService>('leakyBucket', alias);
      await leakyBucket.clear(alias);

      const limit = await leakyBucket.calcLimit(alias);
      if (limit === 0) {
        return;
      }

      // Processing
      let queueItems = await this.storage.queueRepo.findForProcessing(alias, limit);

      this.eventEmitter.emit(QUEUE_BEFORE_PROCESSING, <IQueueProcessingEvent> {
        transport: alias,
        items: queueItems,
      });

      if (queueItems.length > 0) {
        queueItems = <INotificationQueueEntity[]> (await Promise.all(queueItems.map(entity => this.process(entity)))).filter(entity => !!entity);
      }

      this.eventEmitter.emit(QUEUE_AFTER_PROCESSING, <IQueueProcessingEvent> {
        transport: alias,
        items: queueItems,
      });
    });
  }

  /**
   * Process a particular IQueueEntity
   */
  async process(queueEntity: INotificationQueueEntity): Promise<INotificationQueueEntity | null> {
    if (!queueEntity.inProcess || !PROCESSING_STATUSES.includes(queueEntity.status)) {
      console.warn(`Unprocessed queue (#${queueEntity.id}), inProcess: ${queueEntity.inProcess}, status: '${queueEntity.status}'.\n`
        + `Only statuses '${PROCESSING_STATUSES.join("','")}' with attribute inProcess = true can be processed.`);

      return null;
    }
    if (this.storage.notificationRepo && !queueEntity.notification) {
      throw new Error(`queue '${queueEntity.id}': Undefined property 'IQueueEntity::notification'.\nIt must be instance of INotificationEntity.`);
    }

    let processed: INotificationQueueEntity | null = null;

    try {
      const transport = this.getTransport(queueEntity.transport);

      // Processing

      let response: IResponse;
      if (NotificationStatusEnum.WAIT === queueEntity.status) {
        if (!queueEntity.transportResponse) {
          throw new Error(`Unknown 'transportResponse' for QueueEntity (id: ${queueEntity.id}) with status '${queueEntity.status}'`);
        }
        response = await transport.checkStatus(queueEntity.transportResponse);
      } else {
        response = await transport.send(queueEntity.transportData);
      }
      processed = await this.processResponse(queueEntity, response);

      // Leaky Bucket

      const leakyBucket = this.getTransportConfig<ILeakyBucketService>('leakyBucket', transport);
      await leakyBucket.store(processed);

      // Events

      this.eventEmitter.emit(NOTIFICATION_PROCESSED, <INotificationEvent> {
        transport: queueEntity.transport,
        item: processed,
      });

    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Unknown Error');
      return null;
    }

    return processed;
  }

  protected async processResponse(queueEntity: INotificationQueueEntity, response: IResponse): Promise<INotificationQueueEntity> {
    // Update Queue

    queueEntity.status = response.status;
    queueEntity.transportResponse = response.response;
    queueEntity.sentAttempts++;
    queueEntity.sentAt = new Date(Math.floor((new Date()).getTime() / 1000) * 1000);
    queueEntity.nextSend = null;
    queueEntity.inProcess = false;

    // Error Processing

    if (NotificationStatusEnum.ERROR === response.status) {
      const transport = this.getTransport(queueEntity.transport);
      const errorHandler = this.getTransportConfig<IErrorHandler>('errorHandler', transport);

      queueEntity = await errorHandler.handleError(queueEntity, transport, response);
      if (!queueEntity.nextSend) {
        queueEntity.status = NotificationStatusEnum.FAILED;
      }
    }

    // Update Notification

    if (this.storage.notificationRepo && queueEntity.notification) {
      queueEntity.notification = await this.storage.notificationRepo.updateEntity({
        ...queueEntity.notification,
        status: queueEntity.status,
        transportResponse: queueEntity.transportResponse,
        sentAttempts: queueEntity.sentAttempts,
        sentAt: queueEntity.sentAt,
      });
    }

    // Storage processing

    return this.updateStorage(queueEntity);
  }

  protected async updateStorage(queueEntity: INotificationQueueEntity): Promise<INotificationQueueEntity> {
    if (!PROCESSING_STATUSES.includes(queueEntity.status)) {
      this.storage.queueRepo.deleteById(queueEntity.id).then();
      return queueEntity;
    }

    const updated = await this.storage.queueRepo.updateEntity(queueEntity);
    if (!updated) {
      throw new Error(`Can't update queue: '${queueEntity.id}'`);
    }

    return updated;
  }
}
