import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateMissionEvidenceDto {
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

  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;
}
