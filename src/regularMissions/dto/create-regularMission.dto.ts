import {
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { MissionPriority } from '../enum/missionPriority.enum';
import { MissionStatus } from '../enum/missionStatus.enum';

export class CreateRegularMissionDto {
  @IsString({ message: 'El código de la misión debe ser texto.' })
  @IsNotEmpty({ message: 'El código de la misión es obligatorio.' })
  codeName: string;

  @IsString({ message: 'La misión debe tener un objetivo.' })
  @IsNotEmpty({ message: 'La misión debe tener un objetivo.' })
  objective: string;

  @IsString({ message: 'La misión debe tener una descripción.' })
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del capitán es obligatorio.' })
  captain_id: string;

  @IsEnum(MissionPriority, {
    message:
      'La prioridad debe ser una de las siguientes: baja, media, alta, critica.',
  })
  @IsNotEmpty({ message: 'La prioridad es obligatoria.' })
  priority: MissionPriority;

  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe ser una fecha válida.' },
  )
  @IsNotEmpty({ message: 'La fecha de vencimiento es obligatoria.' })
  deadline: string;

  @IsEnum(MissionStatus, {
    message:
      'El estado debe ser una de las siguientes: en proceso, retraso, fracaso, completada.',
  })
  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  status: MissionStatus;

  @IsArray({ message: 'Los agentes asignados deben ser un array.' })
  @IsUUID('all', { each: true, message: 'Cada ID debe ser un UUID válido.' })
  assignedAgents: string[];
}
