import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../enum/notification-type.enum';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsArray({ message: 'Debe proporcionar una lista de IDs de usuarios' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de usuario debe ser un UUID válido',
  })
  userIds: string[];

  @IsEnum(NotificationType, {
    message: 'El tipo de notificación no es válido',
  })
  type: NotificationType;

  @IsOptional()
  @IsUUID(undefined, { message: 'El contextId debe ser un UUID válido' })
  contextId?: string;
}
