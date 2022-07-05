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

- NotificationService: Base service for sending/processing notification or query history;
- NotificationQueueManager: Processing Queue by transport, optional. If it isn't used, you must to manually call
  NotificationService::processQueue(transports?: ITransport | ITransport[]) periodically;

## Default internal configuration of NotificationService

### No Error processing, No LeakyBucket:

```typescript
<IConfig> {
  eventEmitter: new EventEmitter(),
  errorHandler: new DummyErrorHandler(),
  leakyBucket: new DummyBucketService(),
  processingInterval: 3,
}
```

## Demo Sample with In-Memory storage and ConsoleTransport:

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

async function main() {
  // Instantiate Notification Service
  const service = new NotificationService(
    // In-Memory StorageService (IStorageService implementation)
    await new MemoryStorage().initialize(),
    // All necessary ITransport instances for current project
    [
      new ConsoleTransport(),
      // ...,
      // new TransportXXXX(),
    ],
    // optional, override "internal" default configuration
    // In addition this "default" configuration can be overridden by specific ITransport::config
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
  // Or for single transport we can use transport specific string
  // For sample for email transport:
  const recipient: string = 'user-01@mail.test User-01'

  // Prepare data for send (IOriginalData format)
  const data: IOriginalData = {
    recipient,
    // Payload can be IOriginalPayload or its inheritance:
    payload: {
      title: 'Notification',
      body: 'Hello from Notification System!!',
    },
    // Or Payload can be a simple message:
    payload: 'Hello from Notification System!!',
    // Payload will be processed by appropriate IDataProvider implementation
  };

  // Find transport aliases for certain purpose (from database or configuration or define manually)
  // string or array: [TRANSPORT_CONSOLE, TRANSPORT_SMTP, TRANSPORT_XXXX];
  const transport = TRANSPORT_CONSOLE;

  // Send data to selected transport
  await service.send(transport, data);
}
main();
```
