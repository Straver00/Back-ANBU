import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionJoinRequestService } from './missionJoinRequest.service';
import { MissionJoinRequestController } from './missionJoinRequest.controller';
import { MissionJoinRequest } from './entities/missionJoinRequest.entity';
import { User } from '../users/entities/user.entity';
import { RegularMission } from '../regularMissions/entities/regularMission.entity';
import { MissionParticipation } from '../regularMissions/entities/missionParticipation.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MissionJoinRequest,
      User,
      RegularMission,
      MissionParticipation,
    ]),
    NotificationsModule,
  ],
  controllers: [MissionJoinRequestController],
  providers: [MissionJoinRequestService],
  exports: [MissionJoinRequestService],
})
export class MissionJoinRequestModule {}
