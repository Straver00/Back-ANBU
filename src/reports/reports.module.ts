import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity';
import { User } from '../users/entities/user.entity';
import { BountyMission } from '../bountyMissions/entities/bountyMission.entity';
import { RegularMission } from '../regularMissions/entities/regularMission.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, User, BountyMission, RegularMission]),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
