// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { INestApplicationContext } from '@nestjs/common';
// import { Server, ServerOptions, Socket } from 'socket.io';
// import * as express from 'express';
// import { Request } from 'express';
// import { UsersService } from '../../users/users.service';
// import { Session, SessionData } from 'express-session';
//
// interface AuthenticatedRequest extends Request {
//   session: Session &
//     Partial<SessionData> & {
//       userId?: string;
//     };
// }
//
// export class CustomSocketAdapter extends IoAdapter {
//   constructor(
//     private readonly app: INestApplicationContext,
//     private userService: UsersService,
//     private sessionMiddleware: express.RequestHandler,
//   ) {
//     super(app);
//     // console.log('🔧 CustomSocketAdapter inicializado');
//   }
//
//   createIOServer(port: number, options?: Partial<ServerOptions>): Server {
//     // console.log('🔧 CustomSocketAdapter - createIOServer llamado');
//
//     const serverOptions: Partial<ServerOptions> = {
//       ...options,
//       cors: {
//         origin: 'http://localhost:5173',
//         credentials: true,
//       },
//       transports: ['websocket', 'polling'], // Agregar polling para debug
//       allowEIO3: true, // Compatibilidad
//     };
//
//     const server: Server = super.createIOServer(port, serverOptions) as Server;
//     console.log('🔧 Servidor Socket.IO creado');
//
//     // Middleware para autenticación - DEBE ejecutarse ANTES de cualquier conexión
//     server.use(async (socket, next) => {
//       console.log('🔧 ===== MIDDLEWARE EJECUTÁNDOSE =====');
//       console.log('Socket ID:', socket.id);
//
//       const req = socket.request as AuthenticatedRequest;
//       const res = {} as express.Response;
//
//       console.log('Request URL:', req.url);
//       console.log('Request method:', req.method);
//       console.log('Request headers:', JSON.stringify(req.headers, null, 2));
//       console.log('Request cookies:', req.headers.cookie);
//
//       try {
//         // Usar el middleware de sesión compartido
//         await new Promise<void>((resolve, reject) => {
//           this.sessionMiddleware(req, res, (err?: unknown) => {
//             if (err) {
//               console.error('❌ Error en sessionMiddleware:', err);
//               return reject(err);
//             }
//             console.log('✅ SessionMiddleware ejecutado correctamente');
//             resolve();
//           });
//         });
//
//         console.log('Session después del middleware:', req.session);
//         console.log('Session ID:', req.session?.id);
//         console.log('Session userId:', req.session?.userId);
//
//         // Verificar si existe userId en la sesión
//         if (req.session?.userId) {
//           console.log('🔍 Buscando usuario con ID:', req.session.userId);
//
//           try {
//             const user = await this.userService.findOne(req.session.userId);
//             console.log(
//               'Usuario encontrado:',
//               user ? `ID: ${user.id}, Email: ${user.email}` : 'null',
//             );
//
//             if (!user) {
//               console.error(
//                 '❌ Usuario no encontrado para ID:',
//                 req.session.userId,
//               );
//               return next(new Error('Usuario no autorizado'));
//             }
//
//             // Establecer usuario en socket.data
//             socket.data = socket.data || {};
//             socket.data.user = user;
//             console.log('✅ Usuario establecido en socket.data');
//
//             next();
//           } catch (error) {
//             console.error('❌ Error al obtener el usuario:', error);
//             next(new Error('Error al autenticar usuario'));
//           }
//         } else {
//           console.log('❌ No hay userId en la sesión');
//           console.log('Session keys:', Object.keys(req.session || {}));
//           next(new Error('Sesión no válida - no hay userId'));
//         }
//       } catch (error) {
//         console.error('❌ Error en el middleware de autenticación:', error);
//         next(new Error('Error de autenticación'));
//       }
//     });
//
//     // Event listener para conexiones exitosas
//     server.on('connection', (socket: Socket) => {
//       console.log('=== Nueva conexión WebSocket (desde adapter) ===');
//       console.log('Socket ID:', socket.id);
//       console.log('Socket data:', socket.data);
//       console.log(
//         'Usuario en socket.data:',
//         socket.data?.user ? `ID: ${socket.data.user.id}` : 'undefined',
//       );
//
//       if (socket.data?.user) {
//         console.log(`✅ Usuario ${socket.data.user.id} conectado exitosamente`);
//       } else {
//         console.log('❌ Socket conectado sin usuario - ESTO NO DEBERÍA PASAR');
//       }
//     });
//
//     // Event listener para errores de conexión
//     server.on('connect_error', (error) => {
//       console.error('❌ Error de conexión WebSocket:', error);
//     });
//
//     console.log('🔧 Middleware y listeners configurados');
//     return server;
//   }
// }
