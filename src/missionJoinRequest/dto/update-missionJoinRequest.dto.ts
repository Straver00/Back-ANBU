import { IsUUID, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { RequestStatus } from '../enum/requestStatus.enum';
import { RequestType } from '../enum/requestType.enum';

export class UpdateMissionJoinRequestDto {
  @IsUUID()
  @IsOptional()
  missionId?: string;

  @IsUUID()
  @IsOptional()
  agentId?: string;

  @IsEnum(RequestType)
  @IsOptional()
  requestBy?: RequestType;

  @IsBoolean()
  @IsOptional()
  isReinforcement?: boolean;

  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}
