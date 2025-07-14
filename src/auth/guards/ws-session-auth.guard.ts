import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedRequest } from '../intefaces/authenticated-request.interface';

@Injectable()
export class WsSessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedRequest>();
    const user = client.user;

    if (!user) {
      throw new WsException('Unauthorized');
    }

    return true;
  }
}
