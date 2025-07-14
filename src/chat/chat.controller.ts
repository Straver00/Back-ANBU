import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatPaginationQueryDto } from './dto/chat-pagination-query.dto';
import { AuthenticatedRequest } from '../auth/intefaces/authenticated-request.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Message } from './entities/message.entity';
import { Auth } from '../common/decorators/auth.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Auth()
  @Get('/:missionId')
  getRecentMessages(
    @Param('missionId') missionId: string,
    @Query() pagination: ChatPaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaginatedResponse<Message>> {
    return this.chatService.getRecentByMission(
      req.user.id,
      req.user.role,
      missionId,
      pagination,
    );
  }
}
