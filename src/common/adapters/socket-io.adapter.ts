import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { Server, ServerOptions } from 'socket.io';
import { ConfigService } from 'src/config/config.service';

export class CustomSocketAdapter extends IoAdapter {
  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: Partial<ServerOptions>): Server {
    const configService = this.app.get(ConfigService);
    const corsOptions = configService.getCorsConfig(); // si usas getCorsConfig()

    // TODO (security): Validate socket connections with session-based authentication & access control.
    // - Ensure the user is authenticated via session cookie (e.g., parsed from headers or handshake)
    // - Optionally restrict access based on roles or mission membership
    // - Consider extracting the session from the handshake and associating the user with the socket
    // - Apply checks either in `allowRequest` or in gateway handlers with guards/middleware

    const serverOptions: Partial<ServerOptions> = {
      ...options,
      cors: {
        origin: corsOptions.origin,
        credentials: true,
      },
    };

    return super.createIOServer(port, serverOptions) as Server;
  }
}
