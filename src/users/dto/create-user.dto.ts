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
  @MinLength(2, {
    message: 'El nombre completo debe tener al menos 2 caracteres.',
  })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre completo solo puede contener letras y espacios.',
  })
  fullName: string;

  @IsNotEmpty({ message: 'El alias es obligatorio.' })
  @IsString({ message: 'El alias debe ser texto.' })
  @MaxLength(100, { message: 'El alias no puede exceder los 100 caracteres.' })
  @MinLength(3, { message: 'El alias debe tener al menos 3 caracteres.' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'El alias solo puede contener letras, números, guiones y guiones bajos.',
  })
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
    message: 'La contraseña debe contener al menos una letra y un número.',
  })
  password: string;

  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  @IsEnum(UserRole, {
    message: `El rol debe ser uno de los siguientes: ${Object.values(UserRole).join(', ')}.`,
  })
  role: UserRole;
}
