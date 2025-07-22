import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../intefaces/authenticated-request.interface';
import { Request as ExpressRequest, Response } from 'express';
import { VerifyOTPDto } from '../../otp/dto/verify-otp.dto';
import { OTPService } from '../../otp/otp.service';
import { UserResponseDto } from '../../users/dto/response-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OTPService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getOneWithPassword(email);

    if (user && (await this.comparePassword(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async verifyOTP(
    dto: VerifyOTPDto,
  ): Promise<{ isValid: boolean; user?: UserResponseDto }> {
    const user = await this.usersService.findOneByEmail(dto.email);

    const isValid = await this.otpService.verifyOTP({
      email: user.email,
      otpCode: dto.otpCode,
      type: dto.type,
    });
    if (!isValid) {
      return { isValid: false };
    }

    return { isValid: true, user };
  }

  async loginWithSession(
    user: UserResponseDto,
    req: ExpressRequest,
  ): Promise<{ id: string; email: string; role: string }> {
    return new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) {
          return reject(err instanceof Error ? err : new Error(String(err)));
        }
        req.session.userId = user.id;

        const { id, email, role } = user;
        resolve({ id, email, role });
      });
    });
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Error al cerrar sesión'),
          );
        }

        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            return reject(
              new InternalServerErrorException('Error al destruir la sesión'),
            );
          }

          res.clearCookie('connect.sid'); // O el nombre que usaste
          res.send({ message: 'Sesión cerrada correctamente' });
          resolve();
        });
      });
    });
  }

  private async comparePassword(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
