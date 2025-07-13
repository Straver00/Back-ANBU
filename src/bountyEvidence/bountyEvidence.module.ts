import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BountyEvidenceService } from './bountyEvidence.service';
import { BountyEvidenceController } from './bountyEvidence.controller';
import { BountyEvidence } from './entities/bountyEvidence.entity';
import { User } from '../users/entities/user.entity';
import { BountyMission } from '../bountyMissions/entities/bountyMission.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BountyEvidence, User, BountyMission]),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [BountyEvidenceController],
  providers: [BountyEvidenceService],
  exports: [BountyEvidenceService],
})
export class BountyEvidenceModule {}
