import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class YandexIndexingService {
  private readonly yandexApiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.yandexApiKey = process.env.YANDEX_INDEX_API_KEY;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async requestYandexIndexing(url: string) {
    if (!this.isValidUrl(url)) {
      console.error('Invalid URL format:', url);
      return;
    }

    try {
      const yandexIndexingApiUrl = 'https://yandex.com/indexnow';

      const params = {
        url,
        key: this.yandexApiKey,
      };

      const isProduction = !process.env.CLIENT_URL.includes('localhost');
      if (isProduction) {
        const response = await firstValueFrom(
          this.httpService.get(yandexIndexingApiUrl, { params }),
        );
        console.log('Yandex Indexing API response:', response.data);
      } else {
        console.log('Fake send indexing:', params);
      }
    } catch (error) {
      console.error('Failed to send request to Yandex Indexing API', error);
    }
  }
}
