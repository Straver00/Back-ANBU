import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ReportType } from '../enum/reportType.enum';
import { ReportState } from '../enum/reportState.enum';

export class UpdateReportDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  traidorId?: string;

  @IsEnum(ReportType, {
    message: `El tipo de reporte debe ser uno de los siguientes: ${Object.values(ReportType).join(', ')}.`,
  })
  @IsOptional()
  typeReport?: ReportType;

  @IsString()
  @IsOptional()
  @MaxLength(1000, {
    message: 'La descripción no puede exceder los 1000 caracteres',
  })
  description?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  reward?: string;

  @IsEnum(ReportState, {
    message: `El estado debe ser uno de los siguientes: ${Object.values(ReportState).join(', ')}.`,
  })
  @IsOptional()
  state?: ReportState;
}
