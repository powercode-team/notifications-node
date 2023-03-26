# Notification System TypeORM-v0.2 storage

## Description

TypeORM v0.2 storage for [Notification System](https://www.npmjs.com/package/@node-notifications/core)

## Install

> yarn add @node-notifications/storage-typeorm-0.2

## Migrations:

- Copy migrations from library to project migrations directory

``` cp ./node_modules/@node-notifications/storage-typeorm-0.2/migrations/*.js ./migrations/ ```

## TypeORM config:

- [TypeORM documentation](https://typeorm.biunav.com/en/using-ormconfig.html#creating-a-new-connection-from-the-configuration-file)

## Sample usage:

```typescript
import { ConsoleTransport, NotificationQueueManager, NotificationService } from '@node-notifications/core';
import { TypeormStorage } from '@node-notifications/storage-typeorm-0.2';

let service: NotificationService;
let queueManager: NotificationQueueManager;

async function main() {
  // Instantiate Notification Service
  service = new NotificationService(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    await new TypeormStorage().initialize(require('./ormconfig.js')),
    {
      // Log all notification to console (for test/demo purpose)
      console: new ConsoleTransport(),
    },
  );

  // Instantiate Notification Queue Manager and start Queue Processing
  queueManager = new NotificationQueueManager(service).start();
  // To stop Queue Processing:
  // queueManager.stop();

  // ...

  // Sample usage (data: INotification)
  service.send({ recipient: 'user@mail.test', payload: 'Test Notification', transports: ['console'] }).then();
}
```
