import { Body, Controller, Get, Post, Redirect, Render } from '@nestjs/common';
import { TRANSPORT_SMTP } from '@notifications-system/transport-mailer';
import { AppService } from './app.service';
import { MailDto } from './dto/mail.dto';
import { NotificationService } from './notification.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  getHome(): string {
    return this.appService.getHello();
  }

  @Get('mail')
  @Render('mail')
  async getNotification() {
    return {
      'queue': await this.notificationService.findQueueByTransport(TRANSPORT_SMTP),
      'notifications': await this.notificationService.findByTransport(TRANSPORT_SMTP, {
        order: { sentAt: 'DESC', createdAt: 'DESC' },
        limit: 3,
      }),
    };
  }

  @Post('mail/send')
  @Redirect('/mail', 301)
  async sendEmail(@Body() dto: MailDto) {
    await this.notificationService.send(TRANSPORT_SMTP, { recipient: dto.email, payload: dto.message });
  }
}
