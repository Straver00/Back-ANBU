import { Socket } from 'socket.io';
import * as express from 'express';
import * as session from 'express-session';
import { UserResponseDto } from '../../users/dto/response-user.dto';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: UserResponseDto; // El usuario autenticado, opcional al inicio
  };
}

export interface AuthenticatedRequest extends express.Request {
  session: session.Session &
    Partial<session.SessionData> & {
      userId?: string;
    };
}
