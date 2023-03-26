import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemoryStorage, NotificationQueueManager } from '@node-notifications/core';
import { StorageOptions, TypeOrmStorage } from '@node-notifications/storage-typeorm-0.2';
import { ISmtpTransportConfig, MailDataProvider, SmtpTransport } from '@node-notifications/transport-mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configDatabase, configTransportSmtp } from './config';
import { InMemoryNotificationService } from './in-memory-notification.service';
import { OrmNotificationService } from './orm-notification.service';

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
      // Sample NotificationService with InMemory Storage for save Queue / History
      provide: InMemoryNotificationService,
      useFactory: async (configService: ConfigService) => {
        return new InMemoryNotificationService(
          await new MemoryStorage().initialize(600),
          {
            smtp: new SmtpTransport(configService.get<ISmtpTransportConfig>('transport.smtp'), new MailDataProvider()),
          },
          {},
        );
      },
      inject: [ConfigService],
    },
    {
      // Sample NotificationService with Typeorm Storage for save Queue / History
      provide: OrmNotificationService,
      useFactory: async (configService: ConfigService) => {
        return new OrmNotificationService(
          await new TypeOrmStorage().initialize(configService.get<StorageOptions>('database')),
          {
            smtp: new SmtpTransport(configService.get<ISmtpTransportConfig>('transport.smtp'), new MailDataProvider()),
          },
          {},
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {
  private notificationQueueManager: NotificationQueueManager;

  constructor(
    inMemoryNotification: InMemoryNotificationService,
    ormNotification: OrmNotificationService,
  ) {
    // this.notificationQueueManager = new NotificationQueueManager(inMemoryNotification).start();
    this.notificationQueueManager = new NotificationQueueManager(ormNotification).start();
  }
}
