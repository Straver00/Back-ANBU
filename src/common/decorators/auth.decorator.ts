import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';

export function Auth(...roles: string[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(SessionAuthGuard, RolesGuard),
  );
}
