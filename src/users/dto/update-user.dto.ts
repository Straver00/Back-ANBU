import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../enum/userRole.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El alias debe ser texto.' })
  @MaxLength(100, { message: 'El alias no puede exceder los 100 caracteres.' })
  alias?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido.' })
  @MaxLength(50, { message: 'El email no puede exceder los 50 caracteres.' })
  @MinLength(5, { message: 'El email debe tener al menos 5 caracteres.' })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser válido.' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso.' })
  active?: boolean;
}
