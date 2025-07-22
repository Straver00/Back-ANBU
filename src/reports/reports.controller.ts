import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UploadReportDto } from './dto/upload-report.dto';
import { Report } from './entities/report.entity';
import { ReportState } from './enum/reportState.enum';
import { ReportType } from './enum/reportType.enum';
import { RegularMission } from '../regularMissions/entities/regularMission.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto): Promise<Report> {
    return this.reportsService.create(createReportDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadReport(
    @Body() uploadDto: UploadReportDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|pdf|mp4|mov|avi)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<Report> {
    return this.reportsService.uploadReport(uploadDto, file);
  }

  @Get()
  findAll(): Promise<Report[]> {
    return this.reportsService.findAll();
  }

  @Get('state/:state')
  findByState(@Param('state') state: ReportState): Promise<Report[]> {
    return this.reportsService.findByState(state);
  }

  @Get('type/:type')
  findByType(@Param('type') type: ReportType): Promise<Report[]> {
    return this.reportsService.findByType(type);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Report[]> {
    return this.reportsService.findByUser(userId);
  }

  @Get('traidor/:traidorId')
  findByTraidor(@Param('traidorId') traidorId: string): Promise<Report[]> {
    return this.reportsService.findByTraidor(traidorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    return this.reportsService.update(id, updateReportDto);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Body() body: UpdateReportDto) {
    const updateDto: UpdateReportDto = {
      ...body,
      state: ReportState.APROBADO,
    };

    // Obtener información antes de la aprobación
    const report = await this.reportsService.findOne(id);
    let formerMissions: RegularMission[] = [];

    if (report.typeReport === ReportType.POSIBLE_TRAIDOR) {
      formerMissions = await this.reportsService.getMissionsByCaptain(
        report.traidorId,
      );
    }

    // Actualizar el reporte
    const updatedReport = await this.reportsService.update(id, updateDto);

    // Devolver respuesta con información adicional
    return {
      report: updatedReport,
      ...(formerMissions.length > 0 && {
        reassignedMissions: formerMissions.map((mission) => ({
          missionId: mission.id,
          missionCodeName: mission.codeName,
          objective: mission.objective,
          formerCaptain: report.traidor.alias,
        })),
      }),
    };
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string): Promise<Report> {
    return this.reportsService.update(id, { state: ReportState.RECHAZADO });
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<{ message: string }> {
    await this.reportsService.restore(id);
    return { message: 'Reporte restaurado correctamente' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.reportsService.remove(id);
    return { message: 'Reporte eliminado correctamente' };
  }
}
