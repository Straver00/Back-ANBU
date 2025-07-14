import { IsUUID, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadBountyEvidenceDto {
  @IsUUID()
  @IsNotEmpty()
  missionId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500, {
    message: 'La descripción no puede exceder los 500 caracteres',
  })
  description: string;
}
