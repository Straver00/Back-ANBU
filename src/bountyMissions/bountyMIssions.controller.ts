import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { BountyMissionsService } from './bountyMissions.service';
import { CreateBountyMissionDto } from './dto/create-bountyMission.dto';
import { UpdateBountyMissionDto } from './dto/update-bountyMission.dto';

@Controller('bounty-missions')
export class BountyMissionsController {
  constructor(private readonly bountyMissionsService: BountyMissionsService) {}

  @Post()
  create(@Body() createBountyMissionDto: CreateBountyMissionDto) {
    return this.bountyMissionsService.create(createBountyMissionDto);
  }

  @Get()
  findAll() {
    return this.bountyMissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bountyMissionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBountyMissionDto: UpdateBountyMissionDto,
  ) {
    return this.bountyMissionsService.update(id, updateBountyMissionDto);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.bountyMissionsService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bountyMissionsService.remove(id);
  }
}
