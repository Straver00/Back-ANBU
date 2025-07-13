import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
} from '@nestjs/common';
import { MissionEvidenceService } from './missionEvidence.service';
import { CreateMissionEvidenceDto } from './dto/create-missionEvidence.dto';
import { UpdateMissionEvidenceDto } from './dto/update-missionEvidence.dto';
import { UploadMissionEvidenceDto } from './dto/upload-missionEvidence.dto';
import { MissionEvidence } from './entities/missionEvidence.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';

import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

@Controller('mission-evidence')
export class MissionEvidenceController {
  constructor(
    private readonly missionEvidenceService: MissionEvidenceService,
  ) {}

  @Post()
  create(
    @Body() createMissionEvidenceDto: CreateMissionEvidenceDto,
  ): Promise<MissionEvidence> {
    return this.missionEvidenceService.create(createMissionEvidenceDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadEvidence(
    @Body() uploadDto: UploadMissionEvidenceDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<MissionEvidence> {
    return this.missionEvidenceService.uploadEvidence(uploadDto, file);
  }

  @Get()
  findAll(): Promise<MissionEvidence[]> {
    return this.missionEvidenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<MissionEvidence> {
    return this.missionEvidenceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMissionEvidenceDto: UpdateMissionEvidenceDto,
  ): Promise<MissionEvidence> {
    return this.missionEvidenceService.update(id, updateMissionEvidenceDto);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string): Promise<{ message: string }> {
    return this.missionEvidenceService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.missionEvidenceService.remove(id);
  }

  // Endpoints adicionales útiles

  @Get('mission/:missionId')
  findByMission(
    @Param('missionId') missionId: string,
  ): Promise<MissionEvidence[]> {
    return this.missionEvidenceService.findByMission(missionId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<MissionEvidence[]> {
    return this.missionEvidenceService.findByUser(userId);
  }

  @Get('mission/:missionId/user/:userId')
  findByMissionAndUser(
    @Param('missionId') missionId: string,
    @Param('userId') userId: string,
  ): Promise<MissionEvidence[]> {
    return this.missionEvidenceService.findByMissionAndUser(missionId, userId);
  }
}
