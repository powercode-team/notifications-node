import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationQueueManager } from '@node-notifications/core';
import {
  NotificationHistoryRepo,
  NotificationQueueRepo,
  NotificationRepo,
  OrmRepoFactory,
  StorageOptions,
} from '@node-notifications/storage-typeorm-0.2';
import { ISmtpTransportConfig, MailDataProvider, SmtpTransport } from '@node-notifications/transport-mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configDatabase, configTransportSmtp } from './config';
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
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('database'),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    AppService,
    {
      provide: OrmRepoFactory,
      useFactory: async (configService: ConfigService) =>
        new OrmRepoFactory(NotificationRepo, NotificationHistoryRepo, NotificationQueueRepo)
          .initialize(configService.get<StorageOptions>('database')),
      inject: [ConfigService],
    },
    {
      provide: OrmNotificationService,
      useFactory: async (
        ormRepo: OrmRepoFactory,
        configService: ConfigService,
      ) => {
        return new OrmNotificationService({
          historyRepo: ormRepo.notificationRepo,
          queueRepo: ormRepo.notificationRepo,
          transports: {
            smtp: new SmtpTransport(new MailDataProvider(), configService.get<ISmtpTransportConfig>('transport.smtp')),
          },
        });
      },
      inject: [OrmRepoFactory, ConfigService],
    },
  ],
})
export class AppModule {
  private notificationQueueManager: NotificationQueueManager;

  constructor(
    ormNotification: OrmNotificationService,
  ) {
    this.notificationQueueManager = new NotificationQueueManager(ormNotification).start();
  }
}
