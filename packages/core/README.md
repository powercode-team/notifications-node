# Notification System Core Package

## Description

Core package for Notification System

## Install

> yarn add @node-notifications/core

## Documentation

The Core module provide basic notifications/queue logic and interfaces:

- Notification service with queue;
- Notification history;
- Configurable error processing: Default ResendErrorHandler with "Resend Strategy";
- Configurable "Leaky Bucket" provides transport limitation of send count per (time or by try);

## Services

- NotificationService: Base service for sending/processing notifications;
- NotificationQueueManager: Background queue processing service.
  If it isn't used, you must to manually call NotificationService::processQueue() periodically;

## Default configuration of NotificationService

### No Error processing, No LeakyBucket

```typescript
// Internal configuration:
<IConfig> {
  eventEmitter: new EventEmitter(),
  errorHandler: new DummyErrorHandler(),
  leakyBucket: new DummyBucketService(),
  processingInterval: 3,
}
```

## Sample with In-Memory storage and ConsoleTransport

> ConsoleTransport - demo transport that nothing really send, but only logs all message to console

```typescript
import {
  ConsoleTransport,
  GeometryProgressionStrategy,
  INotificationPayload,
  INotificationUser,
  IQueueProcessingEvent,
  LeakyBucketService,
  MemoryStorage,
  NotificationQueueManager,
  NotificationService,
  QUEUE_BEFORE_PROCESSING,
  ResendErrorHandler,
  TRANSPORT_CONSOLE,
} from '@node-notifications/core';
import { randomInt, randomUUID } from 'crypto';

let service: NotificationService;
let queueManager: NotificationQueueManager;

async function main() {
  // Instantiate Notification Service
  service = new NotificationService(
          // In-Memory StorageService (INotificationStorageService implementation)
          await new MemoryStorage().initialize(),
          // All necessary ITransport instances for current project
          {
            [TRANSPORT_CONSOLE]: new ConsoleTransport(),
            // ...,
            // 'transport_XXXX': new TransportXXXX(),
          },
          // optionally change default configuration
          // In addition this configuration can be overridden by ITransport::config (individualy for each transport)
          {
            // ResendErrorHandler with GeometryProgressionStrategy for "error processing"
            // Try resend 20 times from 10 sec interval to 3600 sec used geometry progression (denom 2) to calc next "wait" interval
            // Sample: 10, 20, 40, 80, 160, ... 3600, 3600, ... | max to 20 times or success response
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

  // Instantiate Notification Queue Manager and start Queue Processing
  queueManager = new NotificationQueueManager(service).start();
  // To stop Queue Processing:
  // queueManager.stop();

  // ...

  // Sample

  // Find recipient (from database or configuration or define manually)
  const recipient: INotificationUser = {
    id: randomInt(1e10),
    name: 'User-01',
    email: 'user-01@mail.test',
    phone: '+380001234567',
  };
  // Or for single transport we can use transport specific string
  // As sample for email transport:
  // const recipient = 'user-01@mail.test User-01';

  // Payload will be processed by appropriate IDataProvider implementation for specific transport
  // It can be INotificationPayload:
  const payload: INotificationPayload = {
    subject: 'Notification',
    body: 'Hello from Notification System!!',
  };
  // Or a simple message body string:
  // const payload = 'Hello from Notification System!!';

  // Find transport aliases for certain purpose (from database or configuration or define manually)
  // array: [TRANSPORT_CONSOLE, TRANSPORT_SMTP, TRANSPORT_XXXX];
  const transports = [TRANSPORT_CONSOLE];

  // Sample usage (data: INotification)
  service.send({ recipient, payload, transports }).then();
}
```
