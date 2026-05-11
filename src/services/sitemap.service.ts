import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SitemapService {
  constructor(private readonly httpService: HttpService) {}

  private shouldSendSitemapRequests(): boolean {
    return (
      process.env.PUBLICATION_INTEGRATIONS_ENABLED === 'true' ||
      process.env.NODE_ENV === 'production'
    );
  }

  async triggerSitemapUpdate() {
    if (!this.shouldSendSitemapRequests()) {
      console.log('Skipping sitemap requests outside production');
      return;
    }

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

      await this.pingYandex();
      console.log('Yandex ping sent successfully');
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
