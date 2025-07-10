import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from './intefaces/authenticated-request.interface';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './services/auth.service';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../users/enum/userRole.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: AuthenticatedRequest) {
    return this.authService.loginWithSession(req);
  }

  @Post('logout')
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  @Auth(UserRole.KAGE)
  @Post('me')
  me(@Req() req: AuthenticatedRequest) {
    console.log(req.user);
  }
}
