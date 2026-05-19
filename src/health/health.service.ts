import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

type ServiceStatus = 'ok' | 'degraded';

interface HealthResult {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: Record<string, ServiceStatus>;
}

@Injectable()
export class HealthService {
  private readonly services: Record<string, string>;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    const base = (url: string) => url.replace('/api/v1', '');
    this.services = {
      identity:      base(config.get('services.identityUrl',      'http://localhost:3001/api/v1')),
      social:        base(config.get('services.socialUrl',        'http://localhost:3002/api/v1')),
      content:       base(config.get('services.contentUrl',       'http://localhost:3003/api/v1')),
      feed:          base(config.get('services.feedUrl',          'http://localhost:3004/api/v1')),
      chat:          base(config.get('services.chatUrl',          'http://localhost:3005/api/v1')),
      notifications: base(config.get('services.notificationsUrl', 'http://localhost:3006/api/v1')),
    };
  }

  async check(): Promise<HealthResult> {
    const entries = await Promise.all(
      Object.entries(this.services).map(async ([name, baseUrl]) => {
        const status = await this.ping(`${baseUrl}/api/v1/health`);
        return [name, status] as [string, ServiceStatus];
      }),
    );

    const services = Object.fromEntries(entries) as Record<string, ServiceStatus>;
    const allOk = Object.values(services).every(s => s === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };
  }

  private async ping(url: string): Promise<ServiceStatus> {
    try {
      const response = await firstValueFrom(
        this.http.get(url).pipe(
          timeout(3000),
          catchError(() => of(null)),
        ),
      );
      return response?.status === 200 ? 'ok' : 'degraded';
    } catch {
      return 'degraded';
    }
  }
}
