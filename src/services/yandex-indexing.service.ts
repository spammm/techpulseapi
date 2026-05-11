import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class YandexIndexingService {
  private readonly yandexApiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.yandexApiKey = process.env.YANDEX_INDEX_API_KEY;
  }

  private shouldSendIndexingRequests(): boolean {
    return (
      process.env.PUBLICATION_INTEGRATIONS_ENABLED === 'true' ||
      process.env.NODE_ENV === 'production'
    );
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
    if (!this.shouldSendIndexingRequests()) {
      console.log('Skipping Yandex indexing outside production:', { url });
      return;
    }

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

      const response = await firstValueFrom(
        this.httpService.get(yandexIndexingApiUrl, { params }),
      );
      console.log('Yandex Indexing API response:', response.data);
    } catch (error) {
      console.error('Failed to send request to Yandex Indexing API', error);
    }
  }
}
