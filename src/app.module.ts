import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RegularMissionsModule } from './regularMissions/regularMissions.module';
import { ChatModule } from './chat/chat.module';
//import { NotificationsModule } from './notifications/notifications.module';
//import { ReportsModule } from './reports/reports.module';
import { ConfigurationModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database/type-orm.config';

@Module({
  imports: [
    ConfigurationModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    RegularMissionsModule,
    ChatModule,
    //NotificationsModule,
    //ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
