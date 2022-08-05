# Notifications System mailer transport

## Description

Nodemailer transport for Notifications System

## Install

> npm i @notifications-system/transport-mailer

## Usage

- `MailDataProvider` - Transform data from `IOriginalData` format to transport specific `IMailData` format, implements `IDataProvider`

```typescript
import { MemoryStorage, NotificationService } from '@notifications-system/core';
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
      }, new MailDataProvider()),
    ],
  );
  new NotificationQueueManager(service).queueStart();


  // Sample usage
  service.send(TRANSPORT_SMTP, { recipient: 'user@mail.test', payload: 'Test Notification' });
}
```
