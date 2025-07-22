import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from './intefaces/authenticated-request.interface';
import { Request as ExpressRequest, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './services/auth.service';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../users/enum/userRole.enum';
import { VerifyOTPDto } from '../otp/dto/verify-otp.dto';
import { ResetPasswordDto } from '../otp/dto/reset-password.dto';
import { OTPService } from '../otp/otp.service';
import { OTPType } from '../otp/enum/OTPType';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OTPService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: AuthenticatedRequest) {
    // ✅ Validación de credenciales ya fue hecha por LocalAuthGuard
    // Ahora enviamos OTP al usuario
    await this.otpService.generateOTP({
      email: req.user.email,
      type: OTPType.LOGIN,
    });

    return {
      success: true,
      message: 'OTP enviado. Por favor verifica tu identidad.',
    };
  }

  @Post('logout')
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  @Post('verify')
  async verifyOTP(
    @Body() verifyOTPDto: VerifyOTPDto,
    @Req() req: ExpressRequest,
  ): Promise<{ message: string; isValid: boolean }> {
    const { isValid, user } = await this.authService.verifyOTP(verifyOTPDto);

    if (!isValid) {
      return { message: 'OTP inválido', isValid: false };
    }

    // ✅ Ahora sí autenticamos (crear sesión o emitir JWT)
    await this.authService.loginWithSession(user!, req); // o generar JWT

    return {
      message: 'OTP verificado. Autenticación completa.',
      isValid: true,
    };
  }

  // @Post('reset-password')
  // async resetPassword(
  //   @Body() resetPasswordDto: ResetPasswordDto,
  // ): Promise<{ message: string }> {
  //   await this.otpService.generateOTP({
  //     email: resetPasswordDto.email,
  //     type: OTPType.PASSWORD_RESET,
  //   });
  //
  //   return this.authService.resetPassword(resetPasswordDto);
  // }

  @Auth()
  @Post('me')
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
