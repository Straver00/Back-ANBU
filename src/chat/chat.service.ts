import { ForbiddenException, Injectable } from '@nestjs/common';
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
import { RegularMissionsService } from '../regularMissions/regularMissions.service';
import { UserRole } from '../users/enum/userRole.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private regularMissionService: RegularMissionsService,
  ) {}

  async create(dto: CreateMessageDto): Promise<Message> {
    // validate mission exists
    await this.regularMissionService.findOne(dto.missionId);

    const message = this.messageRepository.create({
      ...dto,
    });

    const savedMessage = await this.messageRepository.save(message);

    const fullMessage = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['user'],
      select: {
        id: true,
        message: true,
        userId: true,
        missionId: true,
        isSystem: true,
        createdAt: true,
        user: {
          id: true,
          alias: true,
        },
      },
    });

    return fullMessage!;
  }

  /**
   * Retrieves the most recent messages from a given mission, ordered by creation time.
   * Applies cursor-based pagination using an optional "before" timestamp.
   *
   * @param userId - ID of the user requesting the messages
   * @param userRole - Role of the user requesting the messages
   * @param missionId - ID of the mission whose messages are being fetched
   * @param options - Optional pagination parameters (e.g., cursor, take)
   * @returns A paginated list of messages with metadata
   */
  async getRecentByMission(
    userId: string,
    userRole: UserRole,
    missionId: string,
    options?: ChatPaginationQueryDto,
  ): Promise<PaginatedResponse<Message>> {
    // validate mission exists
    await this.regularMissionService.findOne(missionId);
    const hasAccess = await this.regularMissionService.userHasAccessToMission(
      userId,
      missionId,
    );

    if (userRole != UserRole.KAGE && !hasAccess) throw new ForbiddenException();

    const take = options?.take ?? 50;

    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.user', 'user')
      .addSelect(['user.id', 'user.alias'])
      .where('message.mission_id = :missionId', { missionId })
      .andWhere('(user.deletedAt IS NULL OR user.id IS NULL)') // 👈 FIX aquí
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC') // Tie-breaker for messages created at the same time
      .take(take + 1); // Fetch one extra to determine if there's a next page

    applyBeforeCursor(query, 'message', 'created_at', options?.before);

    const messages = await query.getMany();
    return buildPaginatedResponse(messages, take, (m) => m.createdAt);
  }
}
