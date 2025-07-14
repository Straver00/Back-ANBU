import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BountyMission } from './entities/bountyMission.entity';
import { CreateBountyMissionDto } from './dto/create-bountyMission.dto';
import { UpdateBountyMissionDto } from './dto/update-bountyMission.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/users/enum/userRole.enum';

@Injectable()
export class BountyMissionsService {
  constructor(
    @InjectRepository(BountyMission)
    private readonly bountyMissionRepository: Repository<BountyMission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createBountyMissionDto: CreateBountyMissionDto,
  ): Promise<BountyMission> {
    // Verificar si la misión ya existe
    const existingMission = await this.bountyMissionRepository.findOneBy({
      traitor: { id: createBountyMissionDto.traitorId },
    });
    if (existingMission) {
      throw new BadRequestException('La misión ya existe');
    }
    const traitor = await this.userRepository.findOneBy({
      id: createBountyMissionDto.traitorId,
    });
    console.log(traitor);
    if (!traitor) {
      throw new Error('Traidor no encontrado');
    }

    traitor.role = UserRole.TRAIDOR;
    await this.userRepository.save(traitor);

    const bountyMission = this.bountyMissionRepository.create({
      reward: createBountyMissionDto.reward,
      completedAt: createBountyMissionDto.completedAt,
      traitor: traitor,
    });
    return this.bountyMissionRepository.save(bountyMission);
  }

  findAll(): Promise<BountyMission[]> {
    return this.bountyMissionRepository.find({ relations: ['traitor'] });
  }

  async findOne(id: string): Promise<BountyMission | { message: string }> {
    const bountyMission = await this.bountyMissionRepository.findOne({
      where: { id },
      relations: ['traitor'],
    });
    if (!bountyMission) {
      return { message: 'BountyMission no encontrada' };
    }
    return bountyMission;
  }

  async update(
    id: string,
    updateBountyMissionDto: UpdateBountyMissionDto,
  ): Promise<BountyMission> {
    const bountyMission = await this.bountyMissionRepository.findOne({
      where: { id },
      relations: ['traitor'],
    });
    if (!bountyMission) {
      throw new NotFoundException('BountyMission no encontrada');
    }
    if (updateBountyMissionDto.traitorId) {
      const traitor = await this.userRepository.findOneBy({
        id: updateBountyMissionDto.traitorId,
      });
      if (!traitor) {
        throw new NotFoundException('Traidor no encontrado');
      }
      console.log(traitor);
      traitor.role = UserRole.TRAIDOR;
      await this.userRepository.save(traitor);
      bountyMission.traitor = traitor;
    }

    if (updateBountyMissionDto.reward !== undefined) {
      bountyMission.reward = updateBountyMissionDto.reward;
    }
    if (updateBountyMissionDto.completedAt !== undefined) {
      bountyMission.completedAt = updateBountyMissionDto.completedAt;
    }
    return this.bountyMissionRepository.save(bountyMission);
  }

  async remove(id: string): Promise<{ message: string }> {
    const bountyMission = await this.bountyMissionRepository.findOne({
      where: { id },
      relations: ['traitor'],
      withDeleted: true,
    });

    if (!bountyMission) {
      return { message: 'BountyMission no encontrada' };
    }

    if (bountyMission.deletedAt) {
      return { message: 'BountyMission ya está eliminada' };
    }

    await this.bountyMissionRepository.softDelete(id);
    return { message: 'BountyMission eliminada exitosamente' };
  }

  async restore(id: string): Promise<{ message: string }> {
    const bountyMission = await this.bountyMissionRepository.findOne({
      where: { id },
      relations: ['traitor'],
      withDeleted: true,
    });

    if (!bountyMission) {
      return { message: 'BountyMission no encontrada' };
    }

    if (!bountyMission.deletedAt) {
      return { message: 'BountyMission ya está restaurada' };
    }

    if (bountyMission.traitor) {
      const traitor = await this.userRepository.findOneBy({
        id: bountyMission.traitor.id,
      });
      if (traitor) {
        traitor.role = UserRole.AGENTE;
        await this.userRepository.save(traitor);
      }
    }

    await this.bountyMissionRepository.restore(id);
    return { message: 'BountyMission restaurada exitosamente' };
  }
}
