import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../enum/userRole.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  @IsString({ message: 'El nombre completo debe ser texto.' })
  @MaxLength(100, {
    message: 'El nombre completo no puede exceder los 100 caracteres.',
  })
  fullName: string;

  @IsNotEmpty({ message: 'El alias es obligatorio.' })
  @IsString({ message: 'El alias debe ser texto.' })
  @MaxLength(100, { message: 'El alias no puede exceder los 100 caracteres.' })
  alias: string;

  @IsNotEmpty({ message: 'El email es obligatorio.' })
  @IsEmail({}, { message: 'El email debe tener un formato válido.' })
  @MaxLength(50, { message: 'El email no puede exceder los 50 caracteres.' })
  @MinLength(5, { message: 'El email debe tener al menos 5 caracteres.' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(60, {
    message: 'La contraseña no puede exceder los 60 caracteres.',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'La contraseña debe contener letras y números.',
  })
  password: string;

  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  @IsEnum(UserRole, { message: 'El rol debe ser válido.' })
  role: UserRole;
}
