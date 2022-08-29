import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemoryStorage, NotificationQueueManager } from '@notifications-system/core';
import { StorageOptions, TypeormStorage } from '@notifications-system/storage-typeorm-0.2';
import { ISmtpTransportConfig, MailDataProvider, SmtpTransport } from '@notifications-system/transport-mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configDatabase, configTransportSmtp } from './config';
import { InMemoryNotification } from './in-memory.notification';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        configDatabase,
        configTransportSmtp,
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    AppService,
    {
      // Sample NotificationService with Typeorm Storage for save Queue / History
      provide: NotificationService,
      useFactory: async (configService: ConfigService) => {
        return new NotificationService(
          await new TypeormStorage().initialize(configService.get<StorageOptions>('database')),
          [
            new SmtpTransport(configService.get<ISmtpTransportConfig>('transport.smtp'), new MailDataProvider()),
          ],
          {},
        );
      },
      inject: [ConfigService],
    },
    {
      // Sample NotificationService with InMemory Storage for save Queue / History
      provide: InMemoryNotification,
      useFactory: async (configService: ConfigService) => {
        return new InMemoryNotification(
          await new MemoryStorage().initialize(600),
          [
            new SmtpTransport(configService.get<ISmtpTransportConfig>('transport.smtp'), new MailDataProvider()),
          ],
          {},
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {
  private notificationQueueManager: NotificationQueueManager;

  constructor(service: NotificationService) {
    this.notificationQueueManager = new NotificationQueueManager(service).queueStart();
  }
}
