import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { WsSessionAuthGuard } from '../../auth/guards/ws-session-auth.guard';

export function WsAuth(...roles: string[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(WsSessionAuthGuard, RolesGuard),
  );
}
