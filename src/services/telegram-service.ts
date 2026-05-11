import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TelegramService {
  private readonly telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly telegramChatId = process.env.TELEGRAM_CHAT_ID;

  constructor(private readonly httpService: HttpService) {}

  private shouldSendTelegramRequests(): boolean {
    return (
      process.env.PUBLICATION_INTEGRATIONS_ENABLED === 'true' ||
      process.env.NODE_ENV === 'production'
    );
  }

  async sendMessageToChannel(message: string): Promise<number> {
    if (!this.shouldSendTelegramRequests()) {
      console.log('Skipping Telegram message outside production');
      return null;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`,
          {
            chat_id: this.telegramChatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: false,
          },
        ),
      );
      const messageId = await response.data.result.message_id;
      console.log(`Post ${messageId} published in teleram`);
      return messageId;
    } catch (error) {
      console.warn('Telegram message was not sent:', error);
      return null;
    }
  }

  async deleteMessageFromChannel(messageId: number): Promise<void> {
    if (!this.shouldSendTelegramRequests()) {
      console.log('Skipping Telegram delete outside production');
      return;
    }

    try {
      await lastValueFrom(
        this.httpService.post(
          `https://api.telegram.org/bot${this.telegramBotToken}/deleteMessage`,
          {
            chat_id: this.telegramChatId,
            message_id: messageId,
          },
        ),
      );
      console.log(`Post ${messageId} removed in Telegram`);
    } catch (error) {
      console.warn('Telegram message was not deleted:', error);
    }
  }

  async sendPhotoToChannel(photoUrl: string, caption: string): Promise<number> {
    if (!this.shouldSendTelegramRequests()) {
      console.log('Skipping Telegram photo outside production');
      return null;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `https://api.telegram.org/bot${this.telegramBotToken}/sendPhoto`,
          {
            chat_id: this.telegramChatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: 'HTML',
          },
        ),
      );

      return response.data.result.message_id;
    } catch (error) {
      console.warn('Telegram photo was not sent:', error);
      return null;
    }
  }
}
