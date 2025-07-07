import {
  IsString,
  IsDate,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { MissionPriority } from '../enum/missionPriority.enum';
import { MissionStatus } from '../enum/missionStatus.enum';

export class CreateRegularMissionDto {
  @IsString()
  @IsNotEmpty()
  codeName: string;

  @IsString()
  @IsNotEmpty()
  objective: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del capitán es obligatorio.' })
  captain_id: string;

  @IsEnum(MissionPriority)
  @IsNotEmpty()
  priority: MissionPriority;

  @IsDate()
  @IsNotEmpty()
  deadline: Date;

  @IsEnum(MissionStatus)
  @IsNotEmpty()
  status: MissionStatus;

  @IsArray()
  @IsUUID('all', { each: true, message: 'Cada ID debe ser un UUID válido.' })
  assignedAgents: string[];
}
