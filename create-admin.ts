import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './src/app.module';
import { CreateAdminService } from './src/auth/create-admin.service';

dotenv.config();

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const createAdminService = app.get(CreateAdminService);
  await createAdminService.createAdmin();
  await app.close();
}

createAdmin();
