import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      //port: 587, //TLS
      port: 465, //SSL
      //secure: false, // true для TLS
      secure: true, // true для SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    variables: any,
  ) {
    const htmlTemplate = this.getTemplate(templateName, variables);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlTemplate, // HTML-шаблон письма
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}`, error);
      throw new Error('Failed to send email');
    }
  }

  // Метод для загрузки шаблона из файла
  private getTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    const templatePath = path.resolve(
      'email-templates',
      `${templateName}.html`,
    );

    let template = fs.readFileSync(templatePath, 'utf8');

    // Заменяем переменные в шаблоне
    Object.keys(variables).forEach((key) => {
      template = template.replace(
        new RegExp(`{{${key}}}`, 'g'),
        variables[key],
      );
    });

    return template;
  }
}
