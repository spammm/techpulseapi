import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GoogleAuth } from 'google-auth-library';
import { firstValueFrom } from 'rxjs';

type googleRequesType = 'URL_UPDATED' | 'URL_DELETED';

@Injectable()
export class GoogleIndexingService {
  private readonly auth: GoogleAuth;

  constructor(private readonly httpService: HttpService) {
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
  }

  private async getAccessToken() {
    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token;
  }

  async requestGoogleIndexing(
    url: string,
    type: googleRequesType = 'URL_UPDATED',
  ) {
    try {
      const token = await this.getAccessToken();
      const googleIndexingApiUrl =
        'https://indexing.googleapis.com/v3/urlNotifications:publish';

      const requestBody = {
        url,
        type,
      };
      const isProduction = !process.env.CLIENT_URL.includes('localhost');
      if (isProduction) {
        const response = await firstValueFrom(
          this.httpService.post(googleIndexingApiUrl, requestBody, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
        );
        console.log('Google Indexing API response:', response.data);
      } else {
        console.log('Fake send indexing: ', requestBody);
      }
    } catch (error) {
      console.error('Failed to send request to Google Indexing API', error);
    }
  }
}
