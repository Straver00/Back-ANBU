import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
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
import { Notification } from './entities/notification.entity';

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

  /**
   * Enviar una notificación a un solo usuario por su ID.
   */
  sendToUser(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notifications:new', notification);
  }

  /**
   * Enviar una misma notificación a varios usuarios (bulk).
   */
  sendToUsersBulk(notifications: Notification[]) {
    console.log(
      `📨 Enviando ${notifications.length} notificaciones en bulk...`,
    );

    const groupedByUser = new Map<string, Notification[]>();

    for (const notification of notifications) {
      const userId = notification.userId;

      if (!groupedByUser.has(userId)) {
        groupedByUser.set(userId, []);
      }

      groupedByUser.get(userId)!.push(notification);
    }

    console.log(
      `👥 Notificaciones agrupadas por ${groupedByUser.size} usuarios.`,
    );

    for (const [userId, userNotifications] of groupedByUser.entries()) {
      console.log(
        `➡️ Emitiendo ${userNotifications.length} notificaciones a user:${userId}`,
      );

      this.server
        .to(`user:${userId}`)
        .emit('notifications:new', userNotifications);

      console.log(`✅ Emitidas a user:${userId}`);
    }

    console.log('🚀 Envío bulk de notificaciones finalizado.');
  }
}
