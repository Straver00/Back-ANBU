import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserResponseDto } from 'src/users/dto/response-user.dto'; // ajusta según tu modelo real
import { UsersService } from 'src/users/users.service'; // servicio que accede a la base de datos

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(
    user: UserResponseDto,
    done: (err: Error | null, id?: string) => void,
  ): void {
    done(null, user.id); // guarda solo el ID en la cookie
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user?: UserResponseDto | false) => void,
  ): Promise<void> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) return done(null, false);

      done(null, user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        done(err);
      } else {
        done(new Error('Unknown error during deserialization'));
      }
    }
  }
}
