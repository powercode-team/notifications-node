# Notifications System TypeORM-v0.3 storage

## Description

TypeORM v0.3 storage for Notifications System

## Install

> npm i @notifications-system/storage-typeorm-0.3

## Migrations:

- Copy migrations from library to project migrations directory

```
cp ./node_modules/@notifications-system/storage-typeorm-0.3/migrations/*.js ./migrations/
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

- [documentation](https://typeorm.biunav.com/en/using-ormconfig.html#creating-a-new-connection-from-the-configuration-file)

- [ormconfig](./ormconfig.js)
- [.env.sample](./.env.sample)

## Sample usage:

```typescript
import { ConsoleTransport, NotificationQueueManager, NotificationService, TRANSPORT_CONSOLE } from '@notifications-system/core';
import { TypeormStorage } from '@notifications-system/storage-typeorm-0.3';

let service: NotificationService;

async function main() {
  // Instantiate Notification Service
  service = new NotificationService(
    await new TypeormStorage().initialize(require('./ormconfig.js')),
    [
      new ConsoleTransport(), // Log all notification to console (for test/demo purpose)
    ],
  );
  new NotificationQueueManager(service).queueStart();


  // Sample usage
  service.send(TRANSPORT_CONSOLE, { recipient: 'user@mail.test', payload: 'Test Notification' });
}
```
