# Notifications System mailer transport

## Description

Nodemailer transport for [Notifications System](https://www.npmjs.com/package/@notifications-system/core)

## Install

> npm i @notifications-system/transport-mailer

## Usage

```typescript
import { IOriginalData, MemoryStorage, NotificationQueueManager, NotificationService } from '@notifications-system/core';
import { MailDataProvider, SmtpTransport, TRANSPORT_SMTP } from '@notifications-system/transport-mailer';

let service: NotificationService;

async function main() {
  // Instantiate Notification Service
  service = new NotificationService(
    await new MemoryStorage().initialize(),
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
        // MailDataProvider - IDataProvider implementation to transform data from `IOriginalData` format to transport specific `IMailData` format
      }, new MailDataProvider()),
      // ...,
      // new TRANSPORT_XXXX(),
    ],
  );
  new NotificationQueueManager(service).queueStart();


  // Sample usage
  const data: IOriginalData = { recipient: 'user@mail.test', payload: 'Test Notification' };
  service.send([TRANSPORT_SMTP/*, TRANSPORT_XXXX*/], data);
}
```
