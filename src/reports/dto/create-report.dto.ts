import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ReportType } from '../enum/reportType.enum';

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  userId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del traidor es obligatorio' })
  traidorId: string;

  @IsEnum(ReportType, {
    message: `El tipo de reporte debe ser uno de los siguientes: ${Object.values(ReportType).join(', ')}.`,
  })
  @IsNotEmpty({ message: 'El tipo de reporte es obligatorio' })
  typeReport: ReportType;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(1000, {
    message: 'La descripción no puede exceder los 1000 caracteres',
  })
  description: string;

  @IsUrl()
  @IsNotEmpty({ message: 'La URL del archivo es obligatoria' })
  fileUrl: string;
}
