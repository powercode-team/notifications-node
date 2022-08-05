import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface ISmtpTransportConfig {
  options: SMTPTransport.Options | SMTPTransport | string,
  defaults?: SMTPTransport.Options,
}
