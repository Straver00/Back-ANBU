import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { DecisionStatus } from './enum/decision-status.enum';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from './enum/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Crea y envía una notificación a múltiples usuarios (bulk)
   */
  async createAndSendBulk(
    notification: CreateNotificationDto,
  ): Promise<Notification[]> {
    const { userIds } = notification;

    console.log(`🛠️ Creando notificaciones para ${userIds.length} usuarios...`);

    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        ...notification,
        userId,
      }),
    );

    const savedNotifications =
      await this.notificationRepository.save(notifications);

    console.log(
      `💾 Guardadas ${savedNotifications.length} notificaciones en la base de datos.`,
    );

    for (const notif of savedNotifications) {
      console.log(
        `📤 Enviando notificación "${notif.id}" al usuario ${notif.userId}...`,
      );
      this.notificationsGateway.sendToUser(notif.userId, notif);
      console.log(`✅ Notificación "${notif.id}" enviada.`);
    }

    console.log(`🚀 Proceso de envío de notificaciones completado.`);

    return savedNotifications;
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
