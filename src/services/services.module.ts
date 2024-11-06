import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleIndexingService } from './google-indexing.service';
import { YandexIndexingService } from './yandex-indexing.service';
import { TelegramService } from './telegram-service';
import { EmailService } from './email.service';

@Module({
  imports: [HttpModule],
  providers: [
    GoogleIndexingService,
    YandexIndexingService,
    TelegramService,
    EmailService,
  ],
  exports: [
    GoogleIndexingService,
    YandexIndexingService,
    TelegramService,
    EmailService,
  ],
})
export class ServicesModule {}
