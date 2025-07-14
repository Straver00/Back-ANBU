import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { RegularMissionsModule } from '../regularMissions/regularMissions.module';
import { ChatController } from './chat.controller';
import { UsersModule } from '../users/users.module';
import { ConfigurationModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    RegularMissionsModule,
    UsersModule,
    ConfigurationModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
