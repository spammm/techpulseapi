import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SitemapService {
  constructor(private readonly httpService: HttpService) {}

  async triggerSitemapUpdate() {
    const isDevelopment = process.env.CLIENT_URL.includes('localhost');
    try {
      // Очистка кэша sitemap
      const response = await lastValueFrom(
        this.httpService.get(
          `${process.env.CLIENT_URL}/api/clear-sitemap-cache`,
          {
            headers: {
              'x-sitemap-secret': process.env.SITEMAP_SECRET,
            },
          },
        ),
      );
      console.log('Sitemap cache cleared successfully', response.data);

      if (!isDevelopment) {
        await this.pingYandex();
        console.log('Yandex ping sent successfully');
      } else {
        console.log('Skipping Yandex ping for local development');
      }
    } catch (error) {
      console.error(
        'Failed to clear sitemap cache or send index request',
        error,
      );
    }
  }

  private async pingYandex() {
    const yandexPingUrl = `https://webmaster.yandex.ru/ping?sitemap=${process.env.CLIENT_URL}/sitemap.xml`;
    try {
      const yandexPingResponse = await lastValueFrom(
        this.httpService.get(yandexPingUrl),
      );
      console.log('Yandex ping successful', yandexPingResponse.data);
    } catch (error) {
      console.error('Failed to ping Yandex', error);
    }
  }
}
