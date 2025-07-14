import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateBountyMissionDto {
  @IsUUID()
  @IsOptional()
  traitorId?: string;

  @IsString()
  @IsOptional()
  reward?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
