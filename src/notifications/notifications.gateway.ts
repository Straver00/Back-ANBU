import {
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as session from 'express-session';
import * as connectPgSimple from 'connect-pg-simple';
import * as express from 'express';

import { Logger } from '@nestjs/common';
import { pgSessionPool } from '../config/database/pg-session.pool';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import {
  AuthenticatedSocket,
  AuthenticatedRequest,
} from '../common/interfaces/authenticated-socket.interface';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger('NotificationGateway');

  @WebSocketServer()
  server: Server;

  private sessionMiddleware: express.RequestHandler;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationsService,
  ) {
    const { secret, maxAge, secure, name } =
      this.configService.getSessionConfig();

    const PgSession = connectPgSimple(session);

    this.sessionMiddleware = session({
      store: new PgSession({
        pool: pgSessionPool,
        tableName: 'session',
      }),
      secret: secret,
      resave: false,
      saveUninitialized: false,
      name: name,
      cookie: {
        maxAge,
        httpOnly: true,
        secure,
        sameSite: 'lax',
      },
    });
  }

  afterInit(server: Server) {
    server.use((socket: AuthenticatedSocket, next) => {
      const req = socket.request as AuthenticatedRequest;
      const res = {} as express.Response;

      new Promise<void>((resolve, reject) => {
        void this.sessionMiddleware(req, res, (err?: unknown) => {
          if (err) {
            if (err instanceof Error) {
              return reject(err);
            } else if (typeof err === 'string') {
              return reject(new Error(err));
            } else {
              return reject(new Error(JSON.stringify(err)));
            }
          }
          resolve();
        });
      })
        .then(async () => {
          const userId = req.session?.userId;
          if (!userId) return next(new Error('Unauthorized'));

          const user = await this.usersService.findOne(userId);
          if (!user) return next(new Error('User not found'));

          socket.data = socket.data || {};
          socket.data.user = user;
          next();
        })
        .catch((err: unknown) => {
          const error =
            err instanceof Error
              ? err
              : new Error(typeof err === 'string' ? err : JSON.stringify(err));
          next(error);
        });
    });
  }

  handleConnection(client: AuthenticatedSocket) {
    const user = client.data?.user;
    if (!user) {
      this.logger.warn('Connection rejected: No user on socket');
      client.disconnect();
      return;
    }

    void client.join(`user:${user.id}`);
    this.logger.log(
      `✅ User ${user.id} connected to notifications (${client.id})`,
    );
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data?.user;
    if (user) {
      this.logger.log(
        `User ${user.id} disconnected from notifications (${client.id})`,
      );
    } else {
      this.logger.log(`Anonymous client disconnected (${client.id})`);
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    const user = client.data?.user;
    if (!user) throw new WsException('Unauthorized');

    // Aquí podrías llamar al servicio que actualiza todas sus notificaciones
    await this.notificationService.markAllAsRead(user.id);

    client.emit('notifications:updated'); // o cualquier feedback necesario
  }
}
