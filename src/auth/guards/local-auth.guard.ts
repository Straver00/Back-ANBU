import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../dto/login.dto';
import { validate } from 'class-validator';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Transform and validate the request body against LoginDto
    const loginDto = plainToInstance(LoginDto, request.body);
    const errors = await validate(loginDto);
    if (errors.length > 0) {
      const errorsMessages = errors.flatMap((err) => {
        return Object.values(err.constraints || {});
      });
      throw new BadRequestException(errorsMessages);
    }

    // If validation is successful, execute Passport authentication
    return (await super.canActivate(context)) as boolean;
  }
}
