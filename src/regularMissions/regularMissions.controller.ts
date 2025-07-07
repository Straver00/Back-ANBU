import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { RegularMission } from './entities/regularMission.entity';
import { RegularMissionsService } from './regularMissions.service';
import { CreateRegularMissionDto } from './dto/create-regularMission.dto';
import { UpdateRegularMissionDto } from './dto/update-regularMission.dto';
import { MissionPriority } from './enum/missionPriority.enum';
import { MissionStatus } from './enum/missionStatus.enum';

@Controller('regular-missions')
export class RegularMissionsController {
  constructor(
    private readonly regularMissionsService: RegularMissionsService,
  ) {}

  @Post()
  async create(
    @Body() createRegularMissionDto: CreateRegularMissionDto,
  ): Promise<RegularMission> {
    return this.regularMissionsService.create(createRegularMissionDto);
  }

  @Get()
  async findAll(): Promise<RegularMission[]> {
    return this.regularMissionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RegularMission> {
    return this.regularMissionsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRegularMissionDto: UpdateRegularMissionDto,
  ): Promise<RegularMission> {
    return this.regularMissionsService.update(id, updateRegularMissionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.regularMissionsService.remove(id);
    return { message: 'Misión eliminada correctamente' };
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<RegularMission> {
    return this.regularMissionsService.restore(id);
  }

  @Get('captain/:captainId')
  async findByCaptain(
    @Param('captainId') captainId: string,
  ): Promise<RegularMission[]> {
    return this.regularMissionsService.findByCaptain(captainId);
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: MissionStatus,
  ): Promise<RegularMission[]> {
    return this.regularMissionsService.findByStatus(status);
  }

  @Get('priority/:priority')
  async findByPriority(
    @Param('priority') priority: MissionPriority,
  ): Promise<RegularMission[]> {
    return this.regularMissionsService.findByPriority(priority);
  }

  @Get('agent/:agentId')
  async findAssignedToAgent(
    @Param('agentId') agentId: string,
  ): Promise<RegularMission[]> {
    return this.regularMissionsService.findAssignedToAgent(agentId);
  }
}
