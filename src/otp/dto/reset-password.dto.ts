import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'El código OTP debe ser una cadena' })
  @IsNotEmpty({ message: 'El código OTP es obligatorio' })
  @Length(6, 6, { message: 'El código OTP debe tener exactamente 6 dígitos' })
  otpCode: string;

  @IsString({ message: 'La contraseña debe ser una cadena' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}
