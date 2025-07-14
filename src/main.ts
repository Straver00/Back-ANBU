import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import * as session from 'express-session';
import * as passport from 'passport';
import * as connectPgSimple from 'connect-pg-simple';
import { pgSessionPool } from './config/database/pg-session.pool';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const { secret, maxAge, secure, name } = configService.getSessionConfig();

  const PgSession = connectPgSimple(session);

  const sessionMiddleware = session({
    store: new PgSession({
      pool: pgSessionPool,
      tableName: 'session',
    }),
    secret: secret,
    resave: false,
    saveUninitialized: false,
    name: name,
    cookie: {
      maxAge: maxAge,
      httpOnly: true,
      secure: secure,
      sameSite: 'lax',
    },
  });

  // Aplicar el middleware a la aplicación
  app.use(sessionMiddleware);

  app.use(passport.initialize());
  app.use(passport.session());

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
  // const usersService = app.get(UsersService);

  // app.useWebSocketAdapter(
  //   new CustomSocketAdapter(app, usersService, sessionMiddleware),
  // );

  const { port } = configService.getAppConfig();
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 App corriendo en el puerto ${port}`);
}

void bootstrap();
