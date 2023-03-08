import { Body, Controller, Get, Post, Redirect, Render } from '@nestjs/common';
import { TRANSPORT_SMTP } from '@node-notifications/transport-mailer';
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
      'queue': await this.notification.findQueueByTransport(TRANSPORT_SMTP),
      'notifications': await this.notification.findByTransport(TRANSPORT_SMTP, {
        order: { sentAt: 'DESC', createdAt: 'DESC' },
        limit: 3,
      }),
    };
  }

  @Post('mail/send')
  @Redirect('/mail', 301)
  async sendEmail(@Body() dto: MailDto) {
    await this.notification.send({ recipient: dto.email, payload: dto.message, transports: [TRANSPORT_SMTP] });
  }
}
