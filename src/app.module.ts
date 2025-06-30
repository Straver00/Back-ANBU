import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MissionsModule } from './missions/missions.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MissionsModule,
    ChatModule,
    NotificationsModule,
    ReportsModule,
    ConfigModule,
    DatabaseModule,
  ],
})
export class AppModule {}
