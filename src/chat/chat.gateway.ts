import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { RegularMissionsService } from '../regularMissions/regularMissions.service';
import { Logger } from '@nestjs/common';
import {
  AuthenticatedSocket,
  AuthenticatedRequest,
} from '../common/interfaces/authenticated-socket.interface';
import { AuthenticatedRemoteSocket } from '../common/interfaces/authenticated-remote-socket.interface';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import * as session from 'express-session';
import * as connectPgSimple from 'connect-pg-simple';
import { pgSessionPool } from '../config/database/pg-session.pool';
import * as express from 'express';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server;

  private sessionMiddleware: express.RequestHandler;

  constructor(
    private readonly chatService: ChatService,
    private readonly regularMissionService: RegularMissionsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    // Crear el middleware de sesión
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
        maxAge: maxAge,
        httpOnly: true,
        secure: secure,
        sameSite: 'lax',
      },
    });
  }

  afterInit(server: Server) {
    // console.log('🔧 ChatGateway inicializado');

    // Configurar middleware de autenticación
    server.use((socket: AuthenticatedSocket, next) => {
      const req = socket.request as AuthenticatedRequest;
      const res = {} as express.Response;

      new Promise<void>((resolve, reject) => {
        void this.sessionMiddleware(req, res, (err?: unknown) => {
          if (err) {
            const error =
              err instanceof Error
                ? err
                : new Error(
                    typeof err === 'string' ? err : JSON.stringify(err),
                  );
            console.error('❌ Error en sessionMiddleware:', error);
            return reject(error);
          }
          // console.log('✅ SessionMiddleware ejecutado correctamente');
          resolve();
        });
      })
        .then(async () => {
          if (req.session?.userId) {
            try {
              const user = await this.usersService.findOne(req.session.userId);

              if (!user) {
                console.error(
                  '❌ Usuario no encontrado para ID:',
                  req.session.userId,
                );
                return next(new Error('Usuario no autorizado'));
              }

              socket.data = socket.data || {};
              socket.data.user = user;
              next();
            } catch (error) {
              console.error('❌ Error al obtener el usuario:', error);
              next(new Error('Error al autenticar usuario'));
            }
          } else {
            next(new Error('Sesión no válida - no hay userId'));
          }
        })
        .catch((error) => {
          console.error('❌ Error en el middleware de autenticación:', error);
          next(new Error('Error de autenticación'));
        });
    });

    // console.log('🔧 Middleware de autenticación configurado');
  }

  handleConnection(client: AuthenticatedSocket) {
    // console.log('=== ChatGateway handleConnection ===');
    // console.log('Client ID:', client.id);
    // console.log('Client data:', client.data);
    // console.log('Client data user:', client.data?.user);

    const user = client.data?.user;

    if (!user) {
      this.logger.error('❌ Cliente sin usuario autenticado, desconectando...');
      client.disconnect();
      return;
    }

    this.logger.log(`✅ User ${user.id} connected to chat (${client.id})`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data?.user;
    if (user) {
      this.logger.log(`User ${user.id} disconnected from chat (${client.id})`);
    } else {
      this.logger.log(`Anonymous client disconnected (${client.id})`);
    }
  }

  @SubscribeMessage('joinMissionRoom')
  async handleJoinMissionRoom(
    @MessageBody() missionId: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // console.log('=== joinMissionRoom ===');
    // console.log('Mission ID:', missionId);
    // console.log('Client ID:', client.id);
    // console.log('Client data:', client.data);
    // console.log('Client data user:', client.data?.user);

    const user = client.data?.user;

    if (!user) {
      this.logger.error('❌ Usuario no encontrado en client.data');
      throw new WsException('Unauthorized');
    }

    const hasAccess = await this.regularMissionService.userHasAccessToMission(
      user.id,
      missionId,
    );
    if (!hasAccess) throw new WsException('Forbidden');

    await client.join(`mission:${missionId}`);
    this.logger.log(`✅ User ${user.id} joined room mission:${missionId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // console.log('=== sendMessage ===');
    // console.log('Client data user:', client.data?.user);

    const user = client.data?.user;

    if (!user) {
      this.logger.error('❌ Usuario no encontrado en client.data');
      throw new WsException('Unauthorized');
    }

    const hasAccess = await this.regularMissionService.userHasAccessToMission(
      user.id,
      dto.missionId,
    );
    if (!hasAccess) throw new WsException('Forbidden');

    const message = await this.chatService.create({
      ...dto,
      userId: user.id,
    });

    this.server.to(`mission:${dto.missionId}`).emit('newMessage', message);

    if (dto.tempId) {
      client.emit('message:sent', {
        ...message,
        tempId: dto.tempId,
      });
    }

    const socketsInRoom = (await this.server
      .in(`mission:${dto.missionId}`)
      .fetchSockets()) as AuthenticatedRemoteSocket[];

    const connectedUserIds = socketsInRoom
      .map((s) => s.data?.user?.id)
      .filter(Boolean);

    const allParticipants = await this.regularMissionService.getUsersInMission(
      dto.missionId,
    );

    const disconnectedUsers = allParticipants.filter(
      (u) => !connectedUserIds.includes(u.id),
    );

    return message;
  }
}
