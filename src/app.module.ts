import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RegularMissionsModule } from './regularMissions/regularMissions.module';
import { BountyMissionsModule } from './bountyMissions/bountyMissions.module';
import { MissionJoinRequestModule } from './missionJoinRequest/missionJoinRequest.module';
import { MissionEvidenceModule } from './missionEvidence/missionEvidence.module';
import { BountyEvidenceModule } from './bountyEvidence/bountyEvidence.module';
import { OTPModule } from './otp/otp.module';
import { ChatModule } from './chat/chat.module';
//import { NotificationsModule } from './notifications/notifications.module';
//import { ReportsModule } from './reports/reports.module';
import { ConfigurationModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database/type-orm.config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigurationModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    RegularMissionsModule,
    BountyMissionsModule,
    MissionJoinRequestModule,
    MissionEvidenceModule,
    BountyEvidenceModule,
    OTPModule,
    CloudinaryModule,
    ChatModule,
    //NotificationsModule,
    //ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
