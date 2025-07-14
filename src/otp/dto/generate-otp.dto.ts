import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OTPType } from '../enum/OTPType';

export class GenerateOTPDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsEnum(OTPType, { message: 'El tipo debe ser login o password_reset' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  type: OTPType;
}
