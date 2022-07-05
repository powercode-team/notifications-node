import EventEmitter from 'events';
import { ObjectHelper } from '../helper';
import {
  IConfig,
  IConfigService,
  IErrorHandler,
  ILeakyBucketService,
  INotificationBase,
  INotificationEntity,
  IOriginalData,
  IQueueEntity,
  IResponse,
  IStorageService,
  ITransport,
} from '../interface';
import { INotificationEvent } from '../interface/event/notification.event';
import { IQueueProcessingEvent } from '../interface/event/queue-processing.event';
import {
  NOTIFICATION_CREATED,
  NOTIFICATION_PROCESSED,
  NotificationStatusEnum,
  PrimaryKey,
  PROCESSING_STATUSES,
  QUEUE_AFTER_PROCESSING,
  QUEUE_BEFORE_PROCESSING,
} from '../type';
import { ConfigService } from './config.service';

export class NotificationService<STORAGE extends IStorageService = IStorageService, ORIGINAL_DATA extends IOriginalData = IOriginalData> {
  protected readonly _storage: STORAGE;
  protected readonly _transports: ITransport[];
  protected readonly _config: IConfigService;
  protected readonly _eventEmitter: EventEmitter;

  constructor(
    storage: STORAGE,
    transports: ITransport[],
    defaultConfig: Partial<IConfig> | IConfigService = new ConfigService(),
  ) {
    if (transports.length < 1) {
      throw new Error('Undefined transports');
    }

    this._storage = storage;
    this._transports = transports;

    this._config = ObjectHelper.isObject(defaultConfig) ? new ConfigService(<Partial<IConfig>> defaultConfig) : <IConfigService> defaultConfig;

    this._eventEmitter = this._config.get('eventEmitter');
  }

  get storage(): STORAGE {
    return this._storage;
  }

  get transports(): ITransport[] {
    return this._transports;
  }

  get config(): IConfigService {
    return this._config;
  }

  get eventEmitter(): EventEmitter {
    return this._eventEmitter;
  }

  getTransport(alias: string): ITransport {
    const transport = this.transports.find(transport => alias === transport.alias);
    if (!transport) {
      throw new Error(`Unknown transport: '${alias}'`);
    }
    return transport;
  }

  getTransports(alias?: string | string[]): ITransport[] {
    switch (true) {
      case typeof alias === 'string':
        return [this.getTransport(<string> alias)];
      case Array.isArray(alias):
        return this.transports.filter(transport => alias?.includes(transport.alias));
      default:
        return this.transports;
    }
  }

  getProcessingInterval(transport: ITransport): number {
    return this._config.get('processingInterval', transport.config);
  }

  getErrorHandler(transport: ITransport): IErrorHandler {
    return this._config.get('errorHandler', transport.config);
  }

  getLeakyBucket(transport: ITransport): ILeakyBucketService {
    return this._config.get('leakyBucket', transport.config);
  }

  /**
   * Mark Notification (history) "as read"
   */
  async markAsRead(id: string): Promise<INotificationEntity | null> {
    return this.storage.notificationRepo?.markAsRead(id) ?? null;
  }

  /**
   * Process ITransport Queue
   */
  processQueue(transports?: ITransport | ITransport[]) {
    if (!transports || (Array.isArray(transports) && transports.length < 1)) {
      transports = this.getTransports();
    } else if (!Array.isArray(transports)) {
      transports = [transports];
    }

    transports.forEach(async transport => {
      // Leaky Bucket
      const leakyBucket = this.getLeakyBucket(transport);
      await leakyBucket.clear(transport.alias);

      const limit = await leakyBucket.calcLimit(transport.alias);
      if (limit === 0) {
        return;
      }

      // Processing
      let queueItems = await this.storage.queueRepo.findForProcessing(transport.alias, limit);

      this.eventEmitter.emit(QUEUE_BEFORE_PROCESSING, <IQueueProcessingEvent> {
        transport: transport.alias,
        items: queueItems,
      });

      if (queueItems.length > 0) {
        queueItems = <IQueueEntity[]> (await Promise.all(queueItems.map(entity => this.process(entity)))).filter(entity => !!entity);
      }

      this.eventEmitter.emit(QUEUE_AFTER_PROCESSING, <IQueueProcessingEvent> {
        transport: transport.alias,
        items: queueItems,
      });
    });
  }

  /**
   * Creates a Notification and queues it or force sent it by certain transports
   */
  async send(transportAlias: string | string[], originalData: ORIGINAL_DATA, force = false): Promise<IQueueEntity[]> {
    if (!transportAlias.length) {
      return [];
    }

    const nextSend = new Date(Math.floor((new Date()).getTime() / 60000) * 60000);

    return <IQueueEntity[]> (await Promise.all(
      this.getTransports(transportAlias).map(async (transport: ITransport) => {
        const transportData = await transport.dataProvider.originToTransport(originalData, originalData.transports?.[transport.alias]);

        const baseData: Partial<INotificationBase<PrimaryKey>> = {
          status: NotificationStatusEnum.NEW,
          transport: transport.alias,
          transportData,
        };

        const notification = (await this.storage.notificationRepo?.createEntity({
          ...baseData,
          recipientId: typeof originalData.recipient === 'string' ? undefined : originalData.recipient.id,
          senderId: originalData.sender?.id,
        })) ?? null;

        let queueEntity = await this.storage.queueRepo.createEntity({
          ...baseData,
          notification,
          nextSend: force ? null : nextSend,
          inProcess: force,
        });
        if (!queueEntity) {
          console.error(`Can't insert notification (${transport.alias}) to queue:\n${JSON.stringify(originalData)}`);
          return null;
        }

        this.eventEmitter.emit(NOTIFICATION_CREATED, <INotificationEvent> {
          transport: transport.alias,
          item: queueEntity,
        });

        if (force) {
          queueEntity = await this.process(queueEntity);
        }

        return queueEntity;
      }),
    )).filter(entity => !!entity);
  }

  /**
   * Process a particular IQueueEntity
   */
  async process(queueEntity: IQueueEntity): Promise<IQueueEntity | null> {
    if (!queueEntity.inProcess || !PROCESSING_STATUSES.includes(queueEntity.status)) {
      const allowedStatuses = PROCESSING_STATUSES.join("','");
      console.warn(`Unprocessed queue (#${queueEntity.id}), inProcess: ${queueEntity.inProcess}, status: '${queueEntity.status}'.\n`
        + `Only statuses '${allowedStatuses}' with attribute inProcess = true can be processed.`);
      return null;
    }
    if (this.storage.notificationRepo && !queueEntity.notification) {
      throw new Error(`queue '${queueEntity.id}': Undefined property 'IQueueEntity::notification'.\nIt must be instance of INotificationEntity.`);
    }

    let processed: IQueueEntity | null = null;

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

      await this.getLeakyBucket(transport).store(processed);

      // Events

      this.eventEmitter.emit(NOTIFICATION_PROCESSED, <INotificationEvent> {
        transport: transport.alias,
        item: processed,
      });

    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Unknown Error');
      return null;
    }

    return processed;
  }

  protected async processResponse(queueEntity: IQueueEntity, response: IResponse): Promise<IQueueEntity> {
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

      queueEntity = await this.getErrorHandler(transport).handleError(queueEntity, transport, response);
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

  protected async updateStorage(queueEntity: IQueueEntity): Promise<IQueueEntity> {
    if (!PROCESSING_STATUSES.includes(queueEntity.status)) {
      this.storage.queueRepo.deleteByID(queueEntity.id).then();
      return queueEntity;
    }

    const updated = await this.storage.queueRepo.updateEntity(queueEntity);
    if (!updated) {
      throw new Error(`Can't update queue: '${queueEntity.id}'`);
    }

    return updated;
  }
}
