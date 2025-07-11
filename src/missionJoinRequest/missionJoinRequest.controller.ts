import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { MissionJoinRequestService } from './missionJoinRequest.service';
import { CreateMissionJoinRequestDto } from './dto/create-missionJoinRequest.dto';
import { UpdateMissionJoinRequestDto } from './dto/update-missionJoinRequest.dto';
import { MissionJoinRequest } from './entities/missionJoinRequest.entity';
import { RequestStatus } from './enum/requestStatus.enum';

@Controller('mission-join-requests')
export class MissionJoinRequestController {
  constructor(
    private readonly missionJoinRequestService: MissionJoinRequestService,
  ) {}

  @Post()
  create(
    @Body() createMissionJoinRequestDto: CreateMissionJoinRequestDto,
  ): Promise<MissionJoinRequest | { message: string }> {
    return this.missionJoinRequestService.create(createMissionJoinRequestDto);
  }

  @Get()
  findAll(): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<MissionJoinRequest | { message: string }> {
    return this.missionJoinRequestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMissionJoinRequestDto: UpdateMissionJoinRequestDto,
  ): Promise<MissionJoinRequest> {
    return this.missionJoinRequestService.update(
      id,
      updateMissionJoinRequestDto,
    );
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string): Promise<{ message: string }> {
    return this.missionJoinRequestService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.missionJoinRequestService.remove(id);
  }

  // Endpoints adicionales útiles

  @Get('mission/:missionId')
  findByMission(
    @Param('missionId') missionId: string,
  ): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestService.findByMission(missionId);
  }

  @Get('agent/:agentId')
  findByAgent(
    @Param('agentId') agentId: string,
  ): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestService.findByAgent(agentId);
  }

  @Get('status/:status')
  findByStatus(
    @Param('status') status: RequestStatus,
  ): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestService.findByStatus(status);
  }

  @Patch(':id/accept')
  acceptRequest(@Param('id') id: string): Promise<MissionJoinRequest> {
    return this.missionJoinRequestService.acceptRequest(id);
  }

  @Patch(':id/reject')
  rejectRequest(@Param('id') id: string): Promise<MissionJoinRequest> {
    return this.missionJoinRequestService.rejectRequest(id);
  }
}
