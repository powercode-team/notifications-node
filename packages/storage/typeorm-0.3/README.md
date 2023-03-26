# Notification System TypeORM-v0.3 storage

## Description

TypeORM v0.3 storage for [Notification System](https://www.npmjs.com/package/@node-notifications/core)

## Install

> yarn add @node-notifications/storage-typeorm-0.3

## Migrations:

- Copy migrations from library to project migrations directory

```
cp ./node_modules/@node-notifications/storage-typeorm-0.3/migrations/*.js ./migrations/
```

- Run migrations

```
./node_modules/.bin/typeorm migration:run
```

- Revert migrations

```
./node_modules/.bin/typeorm migration:revert
```

## TypeORM config:

- [TypeORM documentation](https://typeorm.biunav.com/en/using-ormconfig.html#creating-a-new-connection-from-the-configuration-file)

- [ormconfig sample](https://github.com/powercode-team/notifications-node/tree/main/packages/storage/typeorm-0.3/ormconfig.js)
- [.env.dist](https://github.com/powercode-team/notifications-node/tree/main/packages/storage/typeorm-0.3/.env.dist)

## Sample usage:

```typescript
import { ConsoleTransport, NotificationQueueManager, NotificationService } from '@node-notifications/core';
import { TypeormStorage } from '@node-notifications/storage-typeorm-0.3';

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
