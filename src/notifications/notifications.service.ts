import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { DecisionStatus } from './enum/decision-status.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Crea una nueva notificación.
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({ ...dto });
    return await this.notificationRepository.save(notification);
  }

  /**
   * Obtiene todas las notificaciones de un usuario.
   */
  async getAllForUser(userId: string): Promise<Notification[]> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const grouped: Notification[] = [];
    const messageMap: Map<string, Notification & { count: number }> = new Map();

    for (const notif of notifications) {
      if (notif.type === 'message' && notif.contextId) {
        const key = notif.contextId;

        if (!messageMap.has(key)) {
          messageMap.set(key, { ...notif, count: 1 });
        } else {
          const existing = messageMap.get(key)!;
          existing.count++;
          // Actualiza la fecha si es más reciente
          if (new Date(notif.createdAt) > new Date(existing.createdAt)) {
            existing.createdAt = notif.createdAt;
          }
        }
      } else {
        grouped.push(notif); // no-message => agregar tal cual
      }
    }

    // Agrega las agrupadas al resultado
    grouped.push(...messageMap.values());

    // Reordenamos por fecha de creación
    grouped.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return grouped;
  }

  async getById(id: string): Promise<Notification | null> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  /**
   * Marca una notificación como leída.
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    const notification = await this.getById(id);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notificación no encontrada');
    }

    await this.notificationRepository.update({ id, userId }, { isRead: true });
  }

  /**
   * Marca todas las notificaciones como leídas para un usuario.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId', { userId })
      .execute();
  }

  async updateDecisionStatus(
    id: string,
    userId: string,
    status: DecisionStatus,
  ): Promise<void> {
    await this.notificationRepository.update(
      { id, userId },
      {
        decisionStatus: status,
        isRead: true, // opcional: marcar como leída al responder
      },
    );
  }

  /**
   * Borra una notificación.
   */
  async delete(id: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }
}
