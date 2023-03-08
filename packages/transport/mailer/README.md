# Notification System mailer transport

## Description

Nodemailer transport for [Notification System](https://www.npmjs.com/package/@node-notifications/core)

## Install

> yarn add @node-notifications/transport-mailer

## Usage

```typescript
import { MemoryStorage, NotificationQueueManager, NotificationService } from '@node-notifications/core';
import { MailDataProvider, SmtpTransport, TRANSPORT_SMTP } from '@node-notifications/transport-mailer';

let service: NotificationService;
let queueManager: NotificationQueueManager;

async function main() {
  // Instantiate Notification Service
  service = new NotificationService(
    await new MemoryStorage().initialize(),
    {
      [TRANSPORT_SMTP]: new SmtpTransport({
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
        // MailDataProvider - IDataProvider implementation to transform data from `INotification` format to `IMailData` format
      }, new MailDataProvider()),
    },
  );

  // Instantiate Notification Queue Manager
  queueManager = new NotificationQueueManager(service).start();

  // ...

  // Sample usage (data: INotification)
  service.send({ recipient: 'user@mail.test', payload: 'Test Notification', transports: [TRANSPORT_SMTP] }).then();
}
```
