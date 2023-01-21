import * as nodemailer from 'nodemailer';
import SITE_SETTINGS from '../utils/config';
export interface EmailManager<T = Object> {
  sendMail(mailObj: any): Promise<T>;
}

export class EmailService {
  constructor() { }

  async sendMail(mailObj: any): Promise<object> {
    // const configOption = Utils.getSiteOptions();

    let transporter = nodemailer.createTransport(SITE_SETTINGS.email);

    return await transporter.sendMail(mailObj);
  }
}