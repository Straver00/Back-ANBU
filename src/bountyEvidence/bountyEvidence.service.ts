import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BountyEvidence } from './entities/bountyEvidence.entity';
import { CreateBountyEvidenceDto } from './dto/create-bountyEvidence.dto';
import { UpdateBountyEvidenceDto } from './dto/update-bountyEvidence.dto';
import { UploadBountyEvidenceDto } from './dto/upload-bountyEvidence.dto';
import { User } from '../users/entities/user.entity';
import { BountyMission } from '../bountyMissions/entities/bountyMission.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BountyEvidenceService {
  constructor(
    @InjectRepository(BountyEvidence)
    private readonly bountyEvidenceRepository: Repository<BountyEvidence>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BountyMission)
    private readonly bountyMissionRepository: Repository<BountyMission>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createBountyEvidenceDto: CreateBountyEvidenceDto,
  ): Promise<BountyEvidence> {
    // Validar que la bounty mission existe
    const bountyMission = await this.bountyMissionRepository.findOne({
      where: { id: createBountyEvidenceDto.missionId },
      relations: ['traitor'],
    });
    if (!bountyMission) {
      throw new NotFoundException('Bounty mission no encontrada');
    }

    // Validar que la bounty mission no esté completada
    if (bountyMission.completedAt) {
      throw new BadRequestException(
        'No se pueden subir evidencias a una bounty mission completada',
      );
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOneBy({
      id: createBountyEvidenceDto.userId,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const bountyEvidence = this.bountyEvidenceRepository.create({
      bountyMission,
      user,
      description: createBountyEvidenceDto.description,
      fileUrl: createBountyEvidenceDto.fileUrl,
    });

    return this.bountyEvidenceRepository.save(bountyEvidence);
  }

  async uploadEvidence(
    uploadDto: UploadBountyEvidenceDto,
    file: Express.Multer.File,
  ): Promise<BountyEvidence> {
    const bountyMission = await this.bountyMissionRepository.findOne({
      where: { id: uploadDto.missionId },
      relations: ['traitor'],
    });
    if (!bountyMission) {
      throw new NotFoundException('Bounty mission no encontrada');
    }

    // Validar que la bounty mission no esté completada
    if (bountyMission.completedAt) {
      throw new BadRequestException(
        'No se pueden subir evidencias a una bounty mission completada',
      );
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOneBy({
      id: uploadDto.userId,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Subir archivo a Cloudinary
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
    const fileUrl = cloudinaryResponse.secure_url;

    // Crear la evidencia con la URL de Cloudinary
    const createDto: CreateBountyEvidenceDto = {
      missionId: uploadDto.missionId,
      userId: uploadDto.userId,
      description: uploadDto.description,
      fileUrl: fileUrl,
    };

    return this.create(createDto);
  }

  async findAll(): Promise<BountyEvidence[]> {
    return this.bountyEvidenceRepository.find({
      relations: ['bountyMission', 'user'],
    });
  }

  async findOne(id: string): Promise<BountyEvidence> {
    const evidence = await this.bountyEvidenceRepository.findOne({
      where: { id },
      relations: ['bountyMission', 'user'],
    });
    if (!evidence) {
      throw new NotFoundException('Evidencia de bounty mission no encontrada');
    }
    return evidence;
  }

  async update(
    id: string,
    updateBountyEvidenceDto: UpdateBountyEvidenceDto,
  ): Promise<BountyEvidence> {
    const evidence = await this.bountyEvidenceRepository.findOne({
      where: { id },
      relations: ['bountyMission', 'user'],
    });
    if (!evidence) {
      throw new NotFoundException('Evidencia de bounty mission no encontrada');
    }

    if (updateBountyEvidenceDto.missionId) {
      const bountyMission = await this.bountyMissionRepository.findOneBy({
        id: updateBountyEvidenceDto.missionId,
      });
      if (!bountyMission) {
        throw new NotFoundException('Bounty mission no encontrada');
      }
      evidence.bountyMission = bountyMission;
    }

    if (updateBountyEvidenceDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updateBountyEvidenceDto.userId,
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      evidence.user = user;
    }

    if (updateBountyEvidenceDto.description !== undefined) {
      evidence.description = updateBountyEvidenceDto.description;
    }

    if (updateBountyEvidenceDto.fileUrl !== undefined) {
      evidence.fileUrl = updateBountyEvidenceDto.fileUrl;
    }

    return this.bountyEvidenceRepository.save(evidence);
  }

  async remove(id: string): Promise<{ message: string }> {
    const evidence = await this.bountyEvidenceRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!evidence) {
      throw new NotFoundException('Evidencia de bounty mission no encontrada');
    }

    if (evidence.deletedAt) {
      throw new BadRequestException(
        'Evidencia de bounty mission ya está eliminada',
      );
    }

    await this.bountyEvidenceRepository.softDelete(id);
    return { message: 'Evidencia de bounty mission eliminada exitosamente' };
  }

  async restore(id: string): Promise<{ message: string }> {
    const evidence = await this.bountyEvidenceRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!evidence) {
      throw new NotFoundException('Evidencia de bounty mission no encontrada');
    }

    if (!evidence.deletedAt) {
      throw new BadRequestException(
        'Evidencia de bounty mission ya está restaurada',
      );
    }

    await this.bountyEvidenceRepository.restore(id);
    return { message: 'Evidencia de bounty mission restaurada exitosamente' };
  }

  async findByBountyMission(
    bountyMissionId: string,
  ): Promise<BountyEvidence[]> {
    return this.bountyEvidenceRepository.find({
      where: { bountyMission: { id: bountyMissionId } },
      relations: ['bountyMission', 'user'],
    });
  }

  async findByUser(userId: string): Promise<BountyEvidence[]> {
    return this.bountyEvidenceRepository.find({
      where: { user: { id: userId } },
      relations: ['bountyMission', 'user'],
    });
  }

  async findByBountyMissionAndUser(
    bountyMissionId: string,
    userId: string,
  ): Promise<BountyEvidence[]> {
    return this.bountyEvidenceRepository.find({
      where: {
        bountyMission: { id: bountyMissionId },
        user: { id: userId },
      },
      relations: ['bountyMission', 'user'],
    });
  }
}
