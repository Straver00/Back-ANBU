import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyMissionsController } from './bountyMIssions.controller';
import { BountyMissionsService } from './bountyMissions.service';
import { BountyMission } from './entities/bountyMission.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BountyMission, User])],
  controllers: [BountyMissionsController],
  providers: [BountyMissionsService],
  exports: [BountyMissionsService],
})
export class BountyMissionsModule {}
