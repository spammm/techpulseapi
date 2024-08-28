import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleIndexingService } from './google-indexing.service';

@Module({
  imports: [HttpModule],
  providers: [GoogleIndexingService],
  exports: [GoogleIndexingService],
})
export class ServicesModule {}
