import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { RequestType } from '../enum/requestType.enum';

export class CreateMissionJoinRequestDto {
  @IsUUID()
  @IsNotEmpty()
  missionId: string;

  @IsUUID()
  @IsNotEmpty()
  agentId: string;

  @IsEnum(RequestType)
  @IsNotEmpty()
  requestBy: RequestType;

  @IsBoolean()
  @IsOptional()
  isReinforcement?: boolean;
}
