import { Body, Controller, Get, Post, Redirect, Render } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
import { MailDto } from './dto/mail.dto';
import { OrmNotificationService } from './orm-notification.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly notification: InMemoryNotificationService,
    private readonly notification: OrmNotificationService,
  ) {}

  @Get()
  getHome(): string {
    return this.appService.getHello();
  }

  @Get('mail')
  @Render('mail')
  async getNotification() {
    return {
      'queue': await this.notification.findQueueByTransport('smtp'),
      'notifications': await this.notification.findByTransport('smtp', {
        order: { sentAt: 'DESC', createdAt: 'DESC' },
        limit: 3,
      }),
    };
  }

  @Post('mail/send')
  @Redirect('/mail', 301)
  async sendEmail(@Body() dto: MailDto) {
    await this.notification.send({
      recipient: { id: randomUUID(), type: 'user', name: 'User Name', email: dto.email },
      payload: dto.message,
      transports: ['smtp'],
    });
  }
}
