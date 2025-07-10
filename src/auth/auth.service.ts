import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthenticatedRequest } from './intefaces/authenticated-request.interface';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getOneWithPassword(email);

    if (user && (await this.comparePassword(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async loginWithSession(
    req: AuthenticatedRequest,
  ): Promise<{ id: string; email: string; role: string }> {
    return new Promise((resolve, reject) => {
      req.login(req.user, (err) => {
        if (err) {
          return reject(err instanceof Error ? err : new Error(String(err)));
        }

        const { id, email, role } = req.user;
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
