import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TelegramService {
  private readonly telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly telegramChatId = process.env.TELEGRAM_CHAT_ID;

  constructor(private readonly httpService: HttpService) {}

  async sendMessageToChannel(message: string): Promise<number> {
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
      console.error('Error sending message to Telegram:', error);
      throw error;
    }
  }

  async deleteMessageFromChannel(messageId: number): Promise<void> {
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
      console.error('Error deleting message from Telegram:', error);
      throw error;
    }
  }

  async sendPhotoToChannel(photoUrl: string, caption: string): Promise<number> {
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
      console.error('Error sending photo to Telegram:', error);
      throw error;
    }
  }
}
