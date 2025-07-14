import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { OTPType } from '../enum/OTPType';

export class VerifyOTPDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'El código OTP debe ser una cadena' })
  @IsNotEmpty({ message: 'El código OTP es obligatorio' })
  @Length(6, 6, { message: 'El código OTP debe tener exactamente 6 dígitos' })
  otpCode: string;

  @IsEnum(OTPType, { message: 'El tipo debe ser login o password_reset' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  type: OTPType;
}
