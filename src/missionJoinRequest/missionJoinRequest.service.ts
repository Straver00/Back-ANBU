import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionJoinRequest } from './entities/missionJoinRequest.entity';
import { CreateMissionJoinRequestDto } from './dto/create-missionJoinRequest.dto';
import { UpdateMissionJoinRequestDto } from './dto/update-missionJoinRequest.dto';
import { User } from '../users/entities/user.entity';
import { RegularMission } from '../regularMissions/entities/regularMission.entity';
import { MissionParticipation } from '../regularMissions/entities/missionParticipation.entity';
import { RequestStatus } from './enum/requestStatus.enum';
import { RequestType } from './enum/requestType.enum';
import { MissionStatus } from '../regularMissions/enum/missionStatus.enum';
import { UserRole } from '../users/enum/userRole.enum';

@Injectable()
export class MissionJoinRequestService {
  constructor(
    @InjectRepository(MissionJoinRequest)
    private readonly missionJoinRequestRepository: Repository<MissionJoinRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RegularMission)
    private readonly regularMissionRepository: Repository<RegularMission>,
    @InjectRepository(MissionParticipation)
    private readonly missionParticipationRepository: Repository<MissionParticipation>,
  ) {}

  async create(
    createMissionJoinRequestDto: CreateMissionJoinRequestDto,
  ): Promise<MissionJoinRequest | { message: string }> {
    const mission = await this.regularMissionRepository.findOne({
      where: { id: createMissionJoinRequestDto.missionId },
      relations: ['captain'],
    });
    if (!mission) {
      throw new NotFoundException('Misión no encontrada');
    }

    const agent = await this.userRepository.findOneBy({
      id: createMissionJoinRequestDto.agentId,
    });
    if (!agent) {
      throw new NotFoundException('Agente no encontrado');
    }
    if (agent.role !== UserRole.AGENTE) {
      throw new BadRequestException('El usuario debe ser un agente');
    }

    if (createMissionJoinRequestDto.requestBy === RequestType.AGENT) {
      if (
        ![MissionStatus.RETRASO, MissionStatus.FRACASO].includes(mission.status)
      ) {
        return {
          message:
            'Los agentes solo pueden solicitar unirse a misiones en retraso o fracaso',
        };
      }
    }

    const existingRequest = await this.missionJoinRequestRepository.findOne({
      where: {
        mission: { id: createMissionJoinRequestDto.missionId },
        agent: { id: createMissionJoinRequestDto.agentId },
        status: RequestStatus.PENDIENTE,
      },
    });
    if (existingRequest) {
      throw new BadRequestException(
        'Ya existe una petición pendiente de este agente para esta misión',
      );
    }

    const missionJoinRequest = this.missionJoinRequestRepository.create({
      mission,
      agent,
      requestBy: createMissionJoinRequestDto.requestBy,
      isReinforcement: createMissionJoinRequestDto.isReinforcement || false,
      status: RequestStatus.PENDIENTE,
    });

    return this.missionJoinRequestRepository.save(missionJoinRequest);
  }

  async findAll(): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestRepository.find({
      relations: ['mission', 'agent'],
    });
  }

  async findOne(id: string): Promise<MissionJoinRequest | { message: string }> {
    const request = await this.missionJoinRequestRepository.findOne({
      where: { id },
      relations: ['mission', 'agent'],
    });
    if (!request) {
      throw new NotFoundException('Petición de unión no encontrada');
    }
    return request;
  }

  async update(
    id: string,
    updateMissionJoinRequestDto: UpdateMissionJoinRequestDto,
  ): Promise<MissionJoinRequest> {
    const request = await this.missionJoinRequestRepository.findOne({
      where: { id },
      relations: ['mission', 'agent'],
    });
    if (!request) {
      throw new NotFoundException('Petición de unión no encontrada');
    }

    // Guardar el status anterior para comparar
    const previousStatus = request.status;

    if (updateMissionJoinRequestDto.missionId) {
      const mission = await this.regularMissionRepository.findOneBy({
        id: updateMissionJoinRequestDto.missionId,
      });
      if (!mission) {
        throw new NotFoundException('Misión no encontrada');
      }
      request.mission = mission;
    }

    if (updateMissionJoinRequestDto.agentId) {
      const agent = await this.userRepository.findOneBy({
        id: updateMissionJoinRequestDto.agentId,
      });
      if (!agent) {
        throw new NotFoundException('Agente no encontrado');
      }
      request.agent = agent;
    }

    if (updateMissionJoinRequestDto.requestBy !== undefined) {
      request.requestBy = updateMissionJoinRequestDto.requestBy;
    }

    if (updateMissionJoinRequestDto.isReinforcement !== undefined) {
      request.isReinforcement = updateMissionJoinRequestDto.isReinforcement;
    }

    if (updateMissionJoinRequestDto.status !== undefined) {
      request.status = updateMissionJoinRequestDto.status;
    }

    const updatedRequest =
      await this.missionJoinRequestRepository.save(request);

    if (
      previousStatus !== RequestStatus.ACEPTADA &&
      updatedRequest.status === RequestStatus.ACEPTADA
    ) {
      const existingParticipation =
        await this.missionParticipationRepository.findOne({
          where: {
            mission_id: updatedRequest.mission.id,
            user_id: updatedRequest.agent.id,
          },
        });

      if (!existingParticipation) {
        const participation = this.missionParticipationRepository.create({
          mission: updatedRequest.mission,
          user: updatedRequest.agent,
        });
        await this.missionParticipationRepository.save(participation);
      }
    }

    return updatedRequest;
  }

  async remove(id: string): Promise<{ message: string }> {
    const request = await this.missionJoinRequestRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!request) {
      throw new NotFoundException('Petición de unión no encontrada');
    }

    if (request.deletedAt) {
      throw new BadRequestException('Petición de unión ya está eliminada');
    }

    await this.missionJoinRequestRepository.softDelete(id);
    return { message: 'Petición de unión eliminada exitosamente' };
  }

  async restore(id: string): Promise<{ message: string }> {
    const request = await this.missionJoinRequestRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!request) {
      throw new NotFoundException('Petición de unión no encontrada');
    }

    if (!request.deletedAt) {
      throw new BadRequestException('Petición de unión ya está restaurada');
    }

    await this.missionJoinRequestRepository.restore(id);
    throw new BadRequestException('Petición de unión restaurada exitosamente');
  }

  async findByMission(missionId: string): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestRepository.find({
      where: { mission: { id: missionId } },
      relations: ['mission', 'agent'],
    });
  }

  async findByAgent(agentId: string): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestRepository.find({
      where: { agent: { id: agentId } },
      relations: ['mission', 'agent'],
    });
  }

  async findByStatus(status: RequestStatus): Promise<MissionJoinRequest[]> {
    return this.missionJoinRequestRepository.find({
      where: { status },
      relations: ['mission', 'agent'],
    });
  }

  async acceptRequest(id: string): Promise<MissionJoinRequest> {
    return this.update(id, { status: RequestStatus.ACEPTADA });
  }

  async rejectRequest(id: string): Promise<MissionJoinRequest> {
    return this.update(id, { status: RequestStatus.RECHAZADA });
  }
}
