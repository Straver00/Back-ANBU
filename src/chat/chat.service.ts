import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatPaginationQueryDto } from './dto/chat-pagination-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  applyBeforeCursor,
  buildPaginatedResponse,
} from '../utils/pagination/pagination.helper';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(dto: CreateMessageDto): Promise<Message> {
    if (dto.userId) {
      // TODO: Validate user exists once user service is implemented
    }

    if (dto.missionId) {
      // TODO: Validate mission exists once mission service is implemented
    }
    const message = this.messageRepository.create({
      ...dto,
    });

    return await this.messageRepository.save(message);
  }

  /**
   * Retrieves the most recent messages from a given mission, ordered by creation time.
   * Applies cursor-based pagination using an optional "before" timestamp.
   *
   * @param missionId - ID of the mission whose messages are being fetched
   * @param options - Optional pagination parameters (e.g., cursor, take)
   * @returns A paginated list of messages with metadata
   */
  async getRecentByMission(
    missionId: string,
    options?: ChatPaginationQueryDto,
  ): Promise<PaginatedResponse<Message>> {
    // TODO (security): Add access checks when mission & user services are available
    // - Ensure mission exists
    // - Ensure user exists
    // - Ensure user is allowed to access the mission

    const take = options?.take ?? 50;

    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.mission_id = :missionId', { missionId })
      .orderBy('message.created_at', 'ASC')
      .addOrderBy('message.id', 'ASC') // Tie-breaker for messages created at the same time
      .take(take + 1); // Fetch one extra to determine if there's a next page

    applyBeforeCursor(query, 'message', 'created_at', options?.before);

    const messages = await query.getMany();
    return buildPaginatedResponse(messages, take, (m) => m.createdAt);
  }
}
