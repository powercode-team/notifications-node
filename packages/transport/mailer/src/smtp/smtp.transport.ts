import { AbstractTransport, IDataProvider, IResponse, NotificationStatusEnum } from '@notifications-system/core';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IMailData } from '../mail-data.interface';
import { ISmtpTransportConfig } from './smtp.interface';

export const TRANSPORT_SMTP = 'smtp';

export class SmtpTransport extends AbstractTransport<IMailData> {
  alias: string = TRANSPORT_SMTP;

  protected transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    config: ISmtpTransportConfig,
    public readonly dataProvider: IDataProvider<IMailData>,
  ) {
    super(dataProvider);

    this.transporter = nodemailer.createTransport(config.options, config.defaults);

    this.transporter.verify().then();
  }

  async send(data: IMailData): Promise<IResponse> {
    let status: NotificationStatusEnum;
    let response: SMTPTransport.SentMessageInfo;

    try {
      response = await this.transporter.sendMail(data);
      status = NotificationStatusEnum.SENT;
    } catch (e: any) {
      response = e;
      status = NotificationStatusEnum.ERROR;
    }

    return Promise.resolve({
      status,
      response,
    });
  }
}
