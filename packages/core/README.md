# Notifications System Core Package

## Description

Core package for Notifications System

## Install

> npm i @notifications-system/core

## Exports

> - Services;
> - Interfaces;
> - Types;
> - InMemory Storage;
> - Console Transport;
> - Helpers;

## Description

The Core module provide basic notifications/queue logic and interfaces such as:

- Notification service with queue;
- Notification history;
- Configurable error processing: Default ResendErrorHandler with "Resend Strategy";
- Configurable "Leaky Bucket" provides transport limitation of send count per (time or by try);

## Services

- NotificationService: Base service for sending/processing notifications;
- NotificationQueueManager: Queue processing. If it isn't used, you must to manually call
  NotificationService::processQueue(transports?: ITransport | ITransport[]) periodically;

## Default internal configuration of NotificationService

### No Error processing, No LeakyBucket

```typescript
<IConfig> {
  eventEmitter: new EventEmitter(),
  errorHandler: new DummyErrorHandler(),
  leakyBucket: new DummyBucketService(),
  processingInterval: 3,
}
```

## Demo Sample with In-Memory storage and ConsoleTransport

> ConsoleTransport - demo transport that nothing really send, but only logs all message to console

```typescript
import {
  ConsoleTransport,
  GeometryProgressionStrategy,
  IOriginalData,
  IQueueProcessingEvent,
  MemoryStorage,
  NotificationQueueManager,
  NotificationService,
  QUEUE_BEFORE_PROCESSING,
  ResendErrorHandler,
  TRANSPORT_CONSOLE,
} from '@notifications-system/core';

let service: NotificationService;

async function main() {
  // Instantiate Notification Service
  service = new NotificationService(
    // In-Memory StorageService (IStorageService implementation)
    await new MemoryStorage().initialize(),
    // All necessary ITransport instances for current project
    [
      new ConsoleTransport(),
      // ...,
      // new TransportXXXX(),
    ],
    // optionally override internal default configuration
    // In addition this configuration can be overridden by ITransport::config (individualy for each transport)
    {
      // ResendErrorHandler with GeometryProgressionStrategy for "error processing"
      // Try resend 20 times from 10 sec interval to 3600 sec used geometry progression (denom 2) to calc next "wait" interval
      // 10, 20, 40, 80, 160, ... 3600, 3600, ... | max to 20 times or success response
      errorHandler: new ResendErrorHandler(new GeometryProgressionStrategy(20, 10, 3600)),

      // ILeakyBucketService
      // For example send max 10 messages for each transports by one try
      leakyBucket: new LeakyBucketService(10),
      // Or max 8 messages for each transports in 15 sec
      // leakyBucket: new LeakyBucketService(8, 15),

      // Override processing interval (default: 3 sec)
      processingInterval: 5, // sec
    },
  );

  // Sample Notification subscriber
  service.eventEmitter.on(QUEUE_BEFORE_PROCESSING, (event: IQueueProcessingEvent) => {
    console.info(`process ${event.items.length} at ${(new Date()).toLocaleTimeString()}:`);
  });

  // Start Queue Processing
  const queueManager = new NotificationQueueManager(service).queueStart();
  // To stop Queue Processing:
  // queueManager.queueStop();


  // Sample usage

  // Find recipient (from database or configuration or define manually)
  // const recipient: IUserEntity = {
  //   id: randomUUID(),
  //   name: 'User-01',
  //   email: 'user-01@mail.test',
  //   phone: '+380001234567',
  // };
  //
  // Or for single transport we can use transport specific string
  // As sample for email transport:
  const recipient: string = 'user-01@mail.test User-01'

  // Prepare data for send (IOriginalData format)
  const data: IOriginalData = {
    recipient,
    // Payload will be processed by appropriate IDataProvider implementation for specific transport
    // It can be IOriginalPayload or its inheritance:
    payload: {
      title: 'Notification',
      body: 'Hello from Notification System!!',
    },
    // Or a simple message body string:
    // payload: 'Hello from Notification System!!',
  };

  // Find transport aliases for certain purpose (from database or configuration or define manually)
  // string or array: [TRANSPORT_CONSOLE, TRANSPORT_SMTP, TRANSPORT_XXXX];
  const transport = TRANSPORT_CONSOLE;

  // Send data to selected transport
  await service.send(transport, data);
}
main();
```

## NestJS Integration (with Mail transport and TypeORM-0.2.45 storage)

### Used Packages:

> - [Mailer README](https://github.com/powercode-team/notifications-node/tree/main/packages/transport/mailer/README.md)
> - [TypeORM v0.2 README](https://github.com/powercode-team/notifications-node/tree/main/packages/storage/typeorm-0.2/README.md)

### Install Notification System with necessary packages

- `npm i typeorm@0.2.45`
- `npm i --save-dev typeorm-extension@1.2.2`
- `npm i @notifications-system/core`
- `npm i @notifications-system/transport-mailer`
- `npm i @notifications-system/storage-typeorm-0.2`

### Prepare

- Copy content of [mailer .env.dist](https://github.com/powercode-team/notifications-node/tree/main/packages/transport/mailer/.env.dist)
  to your .env and change parameters for you SMTP Service
- Copy content
  of [typeorm-0.2 .env.dist](https://github.com/powercode-team/notifications-node/tree/main/packages/storage/typeorm-0.2/.env.dist)
  to your .env and change parameters for you database connection

### Migrations

Copy [ormconfig](https://github.com/powercode-team/notifications-node/tree/main/packages/storage/typeorm-0.2/ormconfig.js)
([documentation](https://typeorm.biunav.com/en/using-ormconfig.html#creating-a-new-connection-from-the-configuration-file))
to project root directory:

```
cp ./node_modules/@notifications-system/storage-typeorm-0.2/ormconfig.js ./
```

Copy migrations from library to project migrations directory:

```
cp ./node_modules/@notifications-system/storage-typeorm-0.2/migrations/*.js ./migrations/
```

Run migrations:

```
./node_modules/.bin/typeorm migration:run
```

### Create `notification.service.ts` file in `src` directory

[src/notification.service.ts]:

```typescript
import { Injectable } from '@nestjs/common';
import {
  INotificationEntity,
  IOptions,
  IQueueEntity,
  ITransport,
  NotificationService as BaseService,
  UNREAD_STATUSES,
} from '@notifications-system/core';
import { FindWhere, TypeormStorage } from '@notifications-system/storage-typeorm-0.2';
import { In } from 'typeorm';

/**
 * NotificationService with Typeorm Storage for save Queue / History
 * Main purpose for override BaseService is @Injectable() annotation
 * Also in addition you can extend functionality of notification service specifically for project
 */
@Injectable()
export class NotificationService extends BaseService<TypeormStorage> {
  /**
   * Find Notification (history) by "recipient"
   */
  async findByRecipient(userId: string, transports?: ITransport[], withRead = false, options?: IOptions)
    : Promise<INotificationEntity<string, string>[]> {

    const where: FindWhere<INotificationEntity<string, string>> = {};
    if (transports && transports.length > 0) {
      where.transport = In(transports);
    }
    if (!withRead) {
      where.status = In(UNREAD_STATUSES);
    }

    return this.storage.notificationRepo?.findByRecipient(userId, where, options) ?? [];
  }
}
```

### Modify `app.module.ts`

[src/app.module.ts]:

```typescript
require('dotenv').config();
import { Module } from '@nestjs/common';
import { NotificationQueueManager } from '@notifications-system/core';
import { StorageOptions, TypeormStorage } from '@notifications-system/storage-typeorm-0.2';
import { ISmtpTransportConfig, MailDataProvider, SmtpTransport } from '@notifications-system/transport-mailer';
import { configDatabase, configTransportSmtp } from './config';
import { NotificationService } from './notification.service';

@Module({
  providers: [
    {
      // Sample NotificationService with Typeorm Storage for save Queue / History
      provide: NotificationService,
      useFactory: async () => {
        return new NotificationService(
          await new TypeormStorage().initialize(require('../../ormconfig.js')),
          // All necessary ITransport instances for current project
          [
            new SmtpTransport({
              options: {
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT) || undefined,
                auth: {
                  user: process.env.MAIL_USER,
                  pass: process.env.MAIL_PASS,
                },
              },
              defaults: {
                from: process.env.MAIL_FROM,
              },
            }, new MailDataProvider()),
          ],
          // optionally override internal default configuration
          // In addition this configuration can be overridden by ITransport::config (individualy for each transport)
          {
            // ResendErrorHandler with GeometryProgressionStrategy for "error processing"
            // Try resend 20 times from 10 sec interval to 3600 sec used geometry progression (denom 2) to calc next "wait" interval
            // For example: 10, 20, 40, 80, 160, ... 3600, 3600, ... - max to 20 times or success response
            errorHandler: new ResendErrorHandler(new GeometryProgressionStrategy(20, 10, 3600)),

            // ILeakyBucketService
            // For example send max 10 messages for each transports by one try
            leakyBucket: new LeakyBucketService(10),
            // Or max 8 messages for each transports in 15 sec
            // leakyBucket: new LeakyBucketService(8, 15),

            // Override processing interval (default: 3 sec)
            processingInterval: 5, // sec
          },
        );
      },
    },
  ],
})
export class AppModule {
  private notificationQueueManager: NotificationQueueManager;

  // Start NotificationQueueManager for queue processing
  constructor(service: NotificationService) {
    this.notificationQueueManager = new NotificationQueueManager(service).queueStart();
  }
}
```

### Usage

```typescript
import { IQueueEntity, IUserEntity } from '@notifications-system/core';
import { TRANSPORT_SMTP } from '@notifications-system/transport-mailer';
import { NotificationService } from './notification.service';

@Injectable()
export class SampleService {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  sendEmail(recipient: IUserEntity | string, body: string, title?: string): Promise<IQueueEntity[]> {
    return this.notificationService.send(TRANSPORT_SMTP, { recipient, payload: title ? { title, body } : body });
  }
}
```
