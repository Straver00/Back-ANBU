import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RegularMission } from './entities/regularMission.entity';
import { MissionParticipation } from './entities/missionParticipation.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enum/userRole.enum';
import { CreateRegularMissionDto } from './dto/create-regularMission.dto';
import { UpdateRegularMissionDto } from './dto/update-regularMission.dto';
import { MissionPriority } from './enum/missionPriority.enum';
import { MissionStatus } from './enum/missionStatus.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enum/notification-type.enum';

@Injectable()
export class RegularMissionsService {
  constructor(
    @InjectRepository(RegularMission)
    private readonly regularMissionRepository: Repository<RegularMission>,
    @InjectRepository(MissionParticipation)
    private readonly missionParticipationRepository: Repository<MissionParticipation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createRegularMissionDto: CreateRegularMissionDto,
  ): Promise<RegularMission> {
    // Verificar que el capitán existe
    const captain = await this.userRepository.findOne({
      where: { id: createRegularMissionDto.captain_id },
    });
    if (!captain) {
      throw new BadRequestException('El capitán especificado no existe');
    }

    // Verificar que el capitán no sea traidor
    if (captain.role === UserRole.TRAIDOR) {
      throw new BadRequestException(
        `El usuario ${captain.alias} es un traidor y no puede ser capitán de una misión`,
      );
    }

    // Verificar que los agentes asignados existen
    if (createRegularMissionDto.assignedAgents.length > 0) {
      const assignedAgents = await this.userRepository.find({
        where: { id: In(createRegularMissionDto.assignedAgents) },
      });
      if (
        assignedAgents.length !== createRegularMissionDto.assignedAgents.length
      ) {
        throw new BadRequestException('Uno o más agentes asignados no existen');
      }

      // Verificar que ningún agente asignado sea traidor
      const traitors = assignedAgents.filter(
        (agent) => agent.role === UserRole.TRAIDOR,
      );
      if (traitors.length > 0) {
        const traitorAliases = traitors.map((t) => t.alias).join(', ');
        throw new BadRequestException(
          `Los siguientes usuarios son traidores y no pueden ser asignados a misiones: ${traitorAliases}`,
        );
      }
    }

    const mission = this.regularMissionRepository.create({
      codeName: createRegularMissionDto.codeName,
      objective: createRegularMissionDto.objective,
      description: createRegularMissionDto.description,
      deadline: new Date(createRegularMissionDto.deadline),
      priority: createRegularMissionDto.priority,
      status: createRegularMissionDto.status,
      captain,
    });

    const savedMission = await this.regularMissionRepository.save(mission);

    // Crear las participaciones de agentes
    if (createRegularMissionDto.assignedAgents.length > 0) {
      const participations = createRegularMissionDto.assignedAgents.map(
        (agentId) =>
          this.missionParticipationRepository.create({
            mission: savedMission,
            user: { id: agentId } as User,
          }),
      );
      await this.missionParticipationRepository.save(participations);
    }

    return await this.findOne(savedMission.id);
  }

  async findAll(): Promise<RegularMission[]> {
    return await this.regularMissionRepository.find({
      relations: ['captain', 'participations', 'participations.user'],
    });
  }

  async findOne(id: string): Promise<RegularMission> {
    const mission = await this.regularMissionRepository.findOne({
      where: { id },
    });
    if (!mission) throw new NotFoundException('Misión no encontrada');
    return mission;
  }

  async update(
    id: string,
    updateDto: UpdateRegularMissionDto,
  ): Promise<RegularMission> {
    const mission = await this.regularMissionRepository.findOne({
      where: { id },
      relations: ['captain'],
    });

    if (!mission) throw new NotFoundException('Misión no encontrada');

    let newCaptainAssigned = false;

    // Actualización simple de campos
    if (updateDto.codeName !== undefined) mission.codeName = updateDto.codeName;
    if (updateDto.objective !== undefined)
      mission.objective = updateDto.objective;
    if (updateDto.description !== undefined)
      mission.description = updateDto.description;
    if (updateDto.deadline !== undefined)
      mission.deadline = new Date(updateDto.deadline);
    if (updateDto.priority !== undefined) mission.priority = updateDto.priority;
    if (updateDto.status !== undefined) mission.status = updateDto.status;

    if (updateDto.captain_id !== undefined) {
      const captain = await this.userRepository.findOneBy({
        id: updateDto.captain_id,
      });

      if (!captain) {
        throw new BadRequestException('Capitán no existe');
      }

      if (captain.role === UserRole.TRAIDOR) {
        throw new BadRequestException(
          `El usuario ${captain.alias} es un traidor y no puede ser capitán de una misión`,
        );
      }

      if (!mission.captain || mission.captain.id !== captain.id) {
        mission.captain = captain;
        newCaptainAssigned = true;
      }
    }

    await this.regularMissionRepository.save(mission);

    // 🔔 Notificar al nuevo capitán si fue asignado
    const alreadyNotifiedUserIds = new Set<string>();

    if (newCaptainAssigned && mission.captain) {
      await this.notificationsService.createAndSendBulk({
        userIds: [mission.captain.id],
        message: `Has sido asignado como capitán de la misión "${mission.codeName}".`,
        type: NotificationType.MISSION_NEW_CAPTAIN,
        contextId: mission.id,
      });

      alreadyNotifiedUserIds.add(mission.captain.id);
    }

    // 🔔 Notificar a todos los usuarios que participan en la misión (excepto capitán ya notificado)
    // 🔍 Obtener participantes
    const participations = await this.missionParticipationRepository.find({
      where: { mission_id: mission.id },
    });
    const participantIds = participations.map((p) => p.user_id);
    const captainId = mission.captain?.id;
    if (captainId && !participantIds.includes(captainId)) {
      participantIds.push(captainId);
    }

    // 🔔 Notificaciones según estado
    switch (mission.status) {
      case MissionStatus.FRACASO:
        if (participantIds.length > 0) {
          await this.notificationsService.createAndSendBulk({
            userIds: participantIds,
            message: `La misión "${mission.codeName}" ha fallado.`,
            type: NotificationType.MISSION_FAILED,
            contextId: mission.id,
          });
        }
        break;

      case MissionStatus.RETRASO:
        await this.notificationsService.createAndSendBulk({
          userIds: [], // todos los conectados
          message: `La misión "${mission.codeName}" ha sido marcada como retrasada.`,
          type: NotificationType.MISSION_DELAYED,
          contextId: mission.id,
        });
        break;

      default: {
        // 🔔 Solo se envía 'actualizada' si no fue retraso o fracaso
        const userIdsToUpdate = participantIds.filter(
          (id) => !alreadyNotifiedUserIds.has(id),
        );
        if (userIdsToUpdate.length > 0) {
          await this.notificationsService.createAndSendBulk({
            message: `La misión "${mission.codeName}" ha sido actualizada.`,
            userIds: userIdsToUpdate,
            type: NotificationType.MISSION_UPDATED,
            contextId: mission.id,
          });
        }
        break;
      }
    }

    return this.findOne(mission.id);
  }

  async remove(id: string): Promise<void> {
    const mission = await this.findOne(id);
    await this.regularMissionRepository.softRemove(mission);
  }

  async restore(id: string): Promise<RegularMission> {
    const mission = await this.regularMissionRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!mission) throw new NotFoundException('Misión no encontrada');

    await this.regularMissionRepository.restore(id);
    return await this.findOne(id);
  }

  async findByCaptain(captainId: string): Promise<RegularMission[]> {
    return await this.regularMissionRepository.find({
      where: { captain: { id: captainId } },
      relations: ['captain', 'participations', 'participations.user'],
    });
  }

  async findByStatus(status: MissionStatus): Promise<RegularMission[]> {
    return await this.regularMissionRepository.find({
      where: { status },
      relations: ['captain', 'participations', 'participations.user'],
    });
  }

  async findByPriority(priority: MissionPriority): Promise<RegularMission[]> {
    return await this.regularMissionRepository.find({
      where: { priority },
      relations: ['captain', 'participations', 'participations.user'],
    });
  }

  async userHasAccessToMission(
    userId: string,
    missionId: string,
  ): Promise<boolean> {
    return await this.regularMissionRepository.exists({
      relations: ['captain', 'participations', 'participations.user'],
      where: [
        {
          participations: {
            user_id: userId,
          },
          id: missionId,
        },
        {
          captain: {
            id: userId,
          },
          id: missionId,
        },
      ],
    });
  }

  async getUsersInMission(missionId: string) {
    return await this.missionParticipationRepository.find({
      where: { mission_id: missionId },
    });
  }

  async findAssignedToAgent(agentId: string): Promise<RegularMission[]> {
    return await this.regularMissionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.participations', 'participation')
      .leftJoinAndSelect('participation.user', 'user')
      .leftJoinAndSelect('mission.captain', 'captain')
      .where('user.id = :agentId OR captain.id = :agentId', { agentId })
      .getMany();
  }
}
