import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OTPService } from './otp.service';
import { OTPController } from './otp.controller';
import { OTP } from './entities/otp.entity';
import { User } from '../users/entities/user.entity';
import { emailConfig } from '../config/email';

@Module({
  imports: [
    TypeOrmModule.forFeature([OTP, User]),
    ConfigModule.forFeature(emailConfig),
  ],
  controllers: [OTPController],
  providers: [OTPService],
  exports: [OTPService],
})
export class OTPModule {}
