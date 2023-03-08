import { registerAs } from '@nestjs/config';
import { ISmtpTransportConfig } from '@node-notifications/transport-mailer';

export const cfgTransportSmtp: ISmtpTransportConfig = {
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
};

export const configTransportSmtp = registerAs('transport.smtp', () => cfgTransportSmtp);
