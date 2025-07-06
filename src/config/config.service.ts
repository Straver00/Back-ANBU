import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { CORS_NAMESPACE, CorsConfig } from './cors';
import { DATABASE_NAMESPACE, DatabaseConfig } from './database';
import { SESSION_NAMESPACE, SessionConfig } from './session';
import { APP_NAMESPACE, AppConfig } from './app';

@Injectable()
export class ConfigService extends NestConfigService {
  getAppConfig(): AppConfig {
    return this.get<AppConfig>(APP_NAMESPACE)!;
  }

  getCorsConfig(): CorsConfig {
    return this.get<CorsConfig>(CORS_NAMESPACE)!;
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.get<DatabaseConfig>(DATABASE_NAMESPACE)!;
  }

  getSessionConfig(): SessionConfig {
    return this.get<SessionConfig>(SESSION_NAMESPACE)!;
  }
}
