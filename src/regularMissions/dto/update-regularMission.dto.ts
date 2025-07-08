import {
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { MissionPriority } from '../enum/missionPriority.enum';
import { MissionStatus } from '../enum/missionStatus.enum';

export class UpdateRegularMissionDto {
  @IsOptional()
  @IsString({ message: 'El código de la misión debe ser texto.' })
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
  codeName?: string;

  @IsOptional()
  @IsString({ message: 'El objetivo debe ser texto.' })
  @MaxLength(255, {
    message: 'El objetivo no puede exceder los 255 caracteres.',
  })
  @MinLength(10, { message: 'El objetivo debe tener al menos 10 caracteres.' })
  @Matches(/^[\p{L}\p{N}\s.,!?:;"()\-_/]+$/u, {
    message:
      'El objetivo solo puede contener letras, números, espacios y algunos símbolos.',
  })
  objective?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(2000, {
    message: 'La descripción no puede exceder los 2000 caracteres.',
  })
  @MinLength(20, {
    message: 'La descripción debe tener al menos 20 caracteres.',
  })
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del capitán debe ser un UUID válido.' })
  captain_id?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de vencimiento debe ser una fecha válida en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ).',
    },
  )
  deadline?: string;

  @IsOptional()
  @IsEnum(MissionPriority, {
    message: `La prioridad debe ser una de las siguientes: ${Object.values(MissionPriority).join(', ')}.`,
  })
  priority?: MissionPriority;

  @IsOptional()
  @IsEnum(MissionStatus, {
    message: `El estado debe ser una de las siguientes: ${Object.values(MissionStatus).join(', ')}.`,
  })
  status?: MissionStatus;

  @IsOptional()
  @IsArray({ message: 'Los agentes asignados deben ser un array.' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un agente.' })
  @ArrayMaxSize(10, {
    message: 'No puede asignar más de 10 agentes a una misión.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de agente debe ser un UUID válido.',
  })
  assignedAgents?: string[];
}
