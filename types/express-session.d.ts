import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string; // Extiende la sesión para incluir la propiedad userId
  }
}
