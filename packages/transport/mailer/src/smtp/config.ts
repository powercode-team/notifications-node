import { ISmtpTransportConfig } from '@node-notifications/transport-mailer';

export const configSmtp: ISmtpTransportConfig = {
  options: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 1025,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  defaults: {
    from: process.env.MAIL_FROM || '',
  },
};
