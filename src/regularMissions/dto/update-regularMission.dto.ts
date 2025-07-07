import {
  IsString,
  IsDate,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { MissionPriority } from '../enum/missionPriority.enum';
import { MissionStatus } from '../enum/missionStatus.enum';

export class UpdateRegularMissionDto {
  @IsOptional()
  @IsString()
  codeName?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  captain_id?: string;

  @IsOptional()
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsEnum(MissionPriority)
  priority?: MissionPriority;

  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Cada ID debe ser un UUID válido.' })
  assignedAgents?: string[];
}
