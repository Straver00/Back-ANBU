import {
  IsBoolean,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { MessageUserConsistencyValidator } from '../validators/message-user-consistency.validator';

export class CreateMessageDto {
  @IsUUID(undefined, { message: 'El ID de usuario debe ser un UUID válido' })
  userId: string;

  @IsUUID(undefined, { message: 'El ID de misión debe ser un UUID válido' })
  missionId: string;

  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @MinLength(1, { message: 'El mensaje no puede estar vacío' })
  @MaxLength(1000, {
    message: 'El mensaje no puede tener más de 1000 caracteres',
  })
  message: string;

  @IsBoolean({ message: 'El campo "isSystem" debe ser un valor booleano' })
  isSystem: boolean;

  @IsOptional()
  @IsString()
  tempId?: string;

  @Validate(MessageUserConsistencyValidator)
  __messageUserConsistencyCheck__?: never;
}
