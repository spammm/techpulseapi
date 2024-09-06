import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleIndexingService } from './google-indexing.service';
import { TelegramService } from './telegram-service';

@Module({
  imports: [HttpModule],
  providers: [GoogleIndexingService, TelegramService],
  exports: [GoogleIndexingService, TelegramService],
})
export class ServicesModule {}
