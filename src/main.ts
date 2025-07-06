import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const { port } = configService.getAppConfig();
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 App corriendo en el puerto ${port}`);
}

void bootstrap();
