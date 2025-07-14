import { RemoteSocket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { User } from 'src/users/entities/user.entity';

export interface AuthenticatedRemoteSocket
  extends RemoteSocket<DefaultEventsMap, any> {
  data: {
    user?: User; // Usuario autenticado disponible en esta conexión
  };
  request: {
    user?: User; // Usuario autenticado extraído del middleware de sesión
  };
}
