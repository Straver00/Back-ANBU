import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { CustomSocketAdapter } from './common/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const { port } = configService.getAppConfig();
  await app.listen(port);

  // Enable global pipes for request validation and data transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip out properties that are not defined in DTOs
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        type FlattenedError = { field: string; error: string };

        function flattenErrors(
          errors: ValidationError[],
          parentPath = '',
        ): FlattenedError[] {
          return errors.flatMap((error) => {
            const fieldPath = parentPath
              ? `${parentPath}.${error.property}`
              : error.property;

            const currentLevelErrors: FlattenedError[] = error.constraints
              ? Object.values(error.constraints).map((msg) => ({
                  field: fieldPath,
                  error: msg,
                }))
              : [];

            const childErrors: FlattenedError[] = error.children?.length
              ? flattenErrors(error.children, fieldPath)
              : [];

            return [...currentLevelErrors, ...childErrors];
          });
        }

        const flattened = flattenErrors(validationErrors);
        return new BadRequestException(flattened);
      },
    }),
  );

  // Configure CORS to allow requests from the specified origin in environment variables
  const { origin } = configService.getCorsConfig();
  app.enableCors({
    origin: origin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useWebSocketAdapter(new CustomSocketAdapter(app));

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 App corriendo en el puerto ${port}`);
}

void bootstrap();
