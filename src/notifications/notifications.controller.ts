import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/intefaces/authenticated-request.interface';
import { NotificationsService } from './notifications.service';
import { DecisionStatus } from './enum/decision-status.enum';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return await this.notificationsService.getAllForUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    await this.notificationsService.markAsRead(id, userId);
    return { success: true };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }

  @Patch(':id/decision')
  async updateDecisionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DecisionStatus,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    await this.notificationsService.updateDecisionStatus(id, userId, status);
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    await this.notificationsService.delete(id, userId);
    return { success: true };
  }
}
