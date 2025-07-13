import {
  IsUUID,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateBountyEvidenceDto {
  @IsUUID()
  @IsOptional()
  missionId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'La descripción no puede exceder los 500 caracteres',
  })
  description?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;
}
