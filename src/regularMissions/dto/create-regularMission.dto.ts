import {
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { MissionPriority } from '../enum/missionPriority.enum';
import { MissionStatus } from '../enum/missionStatus.enum';

export class CreateRegularMissionDto {
  @IsString({ message: 'El código de la misión debe ser texto.' })
  @IsNotEmpty({ message: 'El código de la misión es obligatorio.' })
  @MaxLength(255, {
    message: 'El código de la misión no puede exceder los 255 caracteres.',
  })
  @MinLength(3, {
    message: 'El código de la misión debe tener al menos 3 caracteres.',
  })
  @Matches(/^[\p{L}\p{N}\s\-_]+$/u, {
    message:
      'El código de la misión solo puede contener letras, números, espacios, guiones y guiones bajos.',
  })
  codeName: string;

  @IsString({ message: 'La misión debe tener un objetivo.' })
  @IsNotEmpty({ message: 'La misión debe tener un objetivo.' })
  @MaxLength(255, {
    message: 'El objetivo no puede exceder los 255 caracteres.',
  })
  @MinLength(10, { message: 'El objetivo debe tener al menos 10 caracteres.' })
  @Matches(/^[\p{L}\p{N}\s.,!?:;"()\-_/]+$/u, {
    message:
      'El objetivo solo puede contener letras, números, espacios y algunos símbolos.',
  })
  objective: string;

  @IsString({ message: 'La misión debe tener una descripción.' })
  @IsNotEmpty()
  @MaxLength(2000, {
    message: 'La descripción no puede exceder los 2000 caracteres.',
  })
  @MinLength(20, {
    message: 'La descripción debe tener al menos 20 caracteres.',
  })
  description: string;

  @IsUUID('4', { message: 'El ID del capitán debe ser un UUID válido.' })
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
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de agente debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'Debe asignar al menos un agente.' })
  assignedAgents: string[];
}
