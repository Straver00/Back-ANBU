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
import { BountyEvidenceService } from './bountyEvidence.service';
import { CreateBountyEvidenceDto } from './dto/create-bountyEvidence.dto';
import { UpdateBountyEvidenceDto } from './dto/update-bountyEvidence.dto';
import { UploadBountyEvidenceDto } from './dto/upload-bountyEvidence.dto';
import { BountyEvidence } from './entities/bountyEvidence.entity';

@Controller('bounty-evidence')
export class BountyEvidenceController {
  constructor(private readonly bountyEvidenceService: BountyEvidenceService) {}

  @Post()
  create(
    @Body() createBountyEvidenceDto: CreateBountyEvidenceDto,
  ): Promise<BountyEvidence> {
    return this.bountyEvidenceService.create(createBountyEvidenceDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadEvidence(
    @Body() uploadDto: UploadBountyEvidenceDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<BountyEvidence> {
    return this.bountyEvidenceService.uploadEvidence(uploadDto, file);
  }

  @Get()
  findAll(): Promise<BountyEvidence[]> {
    return this.bountyEvidenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BountyEvidence> {
    return this.bountyEvidenceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBountyEvidenceDto: UpdateBountyEvidenceDto,
  ): Promise<BountyEvidence> {
    return this.bountyEvidenceService.update(id, updateBountyEvidenceDto);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string): Promise<{ message: string }> {
    return this.bountyEvidenceService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.bountyEvidenceService.remove(id);
  }

  // Endpoints adicionales útiles

  @Get('bounty-mission/:bountyMissionId')
  findByBountyMission(
    @Param('bountyMissionId') bountyMissionId: string,
  ): Promise<BountyEvidence[]> {
    return this.bountyEvidenceService.findByBountyMission(bountyMissionId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<BountyEvidence[]> {
    return this.bountyEvidenceService.findByUser(userId);
  }

  @Get('bounty-mission/:bountyMissionId/user/:userId')
  findByBountyMissionAndUser(
    @Param('bountyMissionId') bountyMissionId: string,
    @Param('userId') userId: string,
  ): Promise<BountyEvidence[]> {
    return this.bountyEvidenceService.findByBountyMissionAndUser(
      bountyMissionId,
      userId,
    );
  }
}
