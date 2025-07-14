import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OTPService } from './otp.service';
import { GenerateOTPDto } from './dto/generate-otp.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('otp')
export class OTPController {
  constructor(private readonly otpService: OTPService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateOTP(
    @Body() generateOTPDto: GenerateOTPDto,
  ): Promise<{ message: string }> {
    return this.otpService.generateOTP(generateOTPDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(
    @Body() verifyOTPDto: VerifyOTPDto,
  ): Promise<{ message: string; isValid: boolean }> {
    return this.otpService.verifyOTP(verifyOTPDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.otpService.resetPassword(resetPasswordDto);
  }

  @Post('clean-expired')
  @HttpCode(HttpStatus.OK)
  async cleanExpiredOTPs(): Promise<{ message: string }> {
    await this.otpService.cleanExpiredOTPs();
    return { message: 'Códigos OTP expirados eliminados exitosamente' };
  }
}
