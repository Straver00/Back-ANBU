import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateBountyMissionDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del traidor es obligatorio' })
  traitorId: string;

  @IsString({ message: 'La recompensa debe ser texto' })
  @IsNotEmpty({ message: 'La recompensa es obligatoria' })
  reward: string;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
