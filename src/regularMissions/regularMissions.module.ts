import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularMissionsController } from './regularMissions.controller';
import { RegularMissionsService } from './regularMissions.service';
import { RegularMission } from './entities/regularMission.entity';
import { MissionParticipation } from './entities/missionParticipation.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegularMission, MissionParticipation, User]),
  ],
  controllers: [RegularMissionsController],
  providers: [RegularMissionsService],
  exports: [RegularMissionsService],
})
export class RegularMissionsModule {}
