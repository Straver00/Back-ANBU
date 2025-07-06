import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  IsUUID,
} from 'class-validator';
import { MessageUserConsistencyValidator } from '../validators/message-user-consistency.validator';

export class CreateMessageDto {
  @IsOptional()
  @IsUUID()
  @IsInt({ message: 'userId must be an integer' })
  userId?: string;

  @IsUUID()
  @IsInt({ message: 'missionId must be an integer' })
  missionId: string;

  @IsString({ message: 'message must be a string' })
  @MinLength(1, { message: 'message cannot be empty' })
  @MaxLength(1000, { message: 'message cannot exceed 1000 characters' })
  message: string;

  @IsBoolean({ message: 'isSystem must be a boolean value' })
  isSystem: boolean;

  @Validate(MessageUserConsistencyValidator)
  __messageUserConsistencyCheck__?: never;
}
