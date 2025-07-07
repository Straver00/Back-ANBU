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
      ...createRegularMissionDto,
      captain,
      assignedAgents:
        createRegularMissionDto.assignedAgents.length > 0
          ? await this.userRepository.find({
              where: { id: In(createRegularMissionDto.assignedAgents) },
            })
          : [],
    });

    return await this.regularMissionRepository.save(mission);
  }

  async findAll(): Promise<RegularMission[]> {
    return await this.regularMissionRepository.find({
      relations: ['captain', 'assignedAgents'],
    });
  }

  async findOne(id: string): Promise<RegularMission> {
    const mission = await this.regularMissionRepository.findOne({
      where: { id },
      relations: ['captain', 'assignedAgents'],
    });
    if (!mission) throw new NotFoundException('Misión no encontrada');
    return mission;
  }

  async update(
    id: string,
    updateRegularMissionDto: UpdateRegularMissionDto,
  ): Promise<RegularMission> {
    const mission = await this.findOne(id);

    // Verificar que el capitán existe si se está actualizando
    if (updateRegularMissionDto.captain_id) {
      const captain = await this.userRepository.findOne({
        where: { id: updateRegularMissionDto.captain_id },
      });
      if (!captain) {
        throw new BadRequestException('El capitán especificado no existe');
      }
      mission.captain = captain;
    }

    // Verificar que los agentes asignados existen si se están actualizando
    if (updateRegularMissionDto.assignedAgents) {
      const assignedAgents = await this.userRepository.find({
        where: { id: In(updateRegularMissionDto.assignedAgents) },
      });
      if (
        assignedAgents.length !== updateRegularMissionDto.assignedAgents.length
      ) {
        throw new BadRequestException('Uno o más agentes asignados no existen');
      }
      mission.assignedAgents = assignedAgents;
    }

    // Actualizar otros campos
    Object.assign(mission, {
      codeName: updateRegularMissionDto.codeName,
      objective: updateRegularMissionDto.objective,
      description: updateRegularMissionDto.description,
      deadline: updateRegularMissionDto.deadline,
      priority: updateRegularMissionDto.priority,
      status: updateRegularMissionDto.status,
    });

    return await this.regularMissionRepository.save(mission);
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
      relations: ['captain', 'assignedAgents'],
    });
  }

  async findByStatus(status: MissionStatus): Promise<RegularMission[]> {
    return await this.regularMissionRepository.find({
      where: { status },
      relations: ['captain', 'assignedAgents'],
    });
  }

  async findByPriority(priority: MissionPriority): Promise<RegularMission[]> {
    return await this.regularMissionRepository.find({
      where: { priority },
      relations: ['captain', 'assignedAgents'],
    });
  }

  async findAssignedToAgent(agentId: string): Promise<RegularMission[]> {
    return await this.regularMissionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.assignedAgents', 'agent')
      .leftJoinAndSelect('mission.captain', 'captain')
      .where('agent.id = :agentId', { agentId })
      .getMany();
  }
}
