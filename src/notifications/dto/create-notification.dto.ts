import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../enum/notification-type.enum';
import { DecisionStatus } from '../enum/decision-status.enum';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsUUID(undefined, { message: 'El ID del usuario debe ser un UUID válido' })
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsEnum(DecisionStatus)
  decisionStatus?: DecisionStatus;
}
