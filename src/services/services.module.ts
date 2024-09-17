import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleIndexingService } from './google-indexing.service';
import { TelegramService } from './telegram-service';
import { EmailService } from './email.service';

@Module({
  imports: [HttpModule],
  providers: [GoogleIndexingService, TelegramService, EmailService],
  exports: [GoogleIndexingService, TelegramService, EmailService],
})
export class ServicesModule {}
