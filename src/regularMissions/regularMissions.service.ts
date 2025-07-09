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
import { CreateRegularMissionDto } from './dto/create-regularMission.dto';
import { UpdateRegularMissionDto } from './dto/update-regularMission.dto';
import { MissionPriority } from './enum/missionPriority.enum';
import { MissionStatus } from './enum/missionStatus.enum';

@Injectable()
export class RegularMissionsService {
  constructor(
    @InjectRepository(RegularMission)
    private readonly regularMissionRepository: Repository<RegularMission>,
    @InjectRepository(MissionParticipation)
    private readonly missionParticipationRepository: Repository<MissionParticipation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    if (updateDto.captain_id) {
      const captain = await this.userRepository.findOneBy({
        id: updateDto.captain_id,
      });
      if (!captain) throw new BadRequestException('Capitán no existe');
      mission.captain = captain;
      await this.regularMissionRepository.save(mission);
    }

    // Verificar si los agentes existen
    if (updateDto.assignedAgents) {
      const assignedAgents = await this.userRepository.find({
        where: { id: In(updateDto.assignedAgents) },
      });
      if (assignedAgents.length !== updateDto.assignedAgents.length) {
        throw new BadRequestException('Uno o más agentes asignados no existen');
      }
    }

    if (updateDto.assignedAgents) {
      await this.missionParticipationRepository.delete({
        mission_id: mission.id,
      });

      const participations = updateDto.assignedAgents.map((agentId) =>
        this.missionParticipationRepository.create({
          mission_id: mission.id,
          user_id: agentId,
        }),
      );
      await this.missionParticipationRepository.save(participations);
    }
    return await this.findOne(id);
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

  async findAssignedToAgent(agentId: string): Promise<RegularMission[]> {
    return await this.regularMissionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.participations', 'participation')
      .leftJoinAndSelect('participation.user', 'user')
      .leftJoinAndSelect('mission.captain', 'captain')
      .where('user.id = :agentId', { agentId })
      .getMany();
  }
}
