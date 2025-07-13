import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MissionEvidenceService } from './missionEvidence.service';
import { MissionEvidenceController } from './missionEvidence.controller';
import { MissionEvidence } from './entities/missionEvidence.entity';
import { User } from '../users/entities/user.entity';
import { RegularMission } from '../regularMissions/entities/regularMission.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MissionEvidence, User, RegularMission]),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [MissionEvidenceController],
  providers: [MissionEvidenceService],
  exports: [MissionEvidenceService],
})
export class MissionEvidenceModule {}
