import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionEvidence } from './entities/missionEvidence.entity';
import { CreateMissionEvidenceDto } from './dto/create-missionEvidence.dto';
import { UpdateMissionEvidenceDto } from './dto/update-missionEvidence.dto';
import { UploadMissionEvidenceDto } from './dto/upload-missionEvidence.dto';
import { User } from '../users/entities/user.entity';
import { RegularMission } from '../regularMissions/entities/regularMission.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MissionEvidenceService {
  constructor(
    @InjectRepository(MissionEvidence)
    private readonly missionEvidenceRepository: Repository<MissionEvidence>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RegularMission)
    private readonly regularMissionRepository: Repository<RegularMission>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createMissionEvidenceDto: CreateMissionEvidenceDto,
  ): Promise<MissionEvidence> {
    // Validar que el usuario es capitán de la misión
    const mission = await this.regularMissionRepository.findOne({
      where: { id: createMissionEvidenceDto.missionId },
      relations: ['captain'],
    });
    if (!mission) {
      throw new NotFoundException('Misión no encontrada');
    }
    if (mission.captain.id !== createMissionEvidenceDto.userId) {
      throw new ForbiddenException(
        'Solo el capitán de la misión puede subir evidencias',
      );
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOneBy({
      id: createMissionEvidenceDto.userId,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const missionEvidence = this.missionEvidenceRepository.create({
      mission,
      user,
      description: createMissionEvidenceDto.description,
      fileUrl: createMissionEvidenceDto.fileUrl,
    });

    return this.missionEvidenceRepository.save(missionEvidence);
  }

  async uploadEvidence(
    uploadDto: UploadMissionEvidenceDto,
    file: Express.Multer.File,
  ): Promise<MissionEvidence> {
    // Validar que el usuario es capitán de la misión
    const mission = await this.regularMissionRepository.findOne({
      where: { id: uploadDto.missionId },
      relations: ['captain'],
    });
    if (!mission) {
      throw new NotFoundException('Misión no encontrada');
    }
    if (mission.captain.id !== uploadDto.userId) {
      throw new ForbiddenException(
        'Solo el capitán de la misión puede subir evidencias',
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
    const createDto: CreateMissionEvidenceDto = {
      missionId: uploadDto.missionId,
      userId: uploadDto.userId,
      description: uploadDto.description,
      fileUrl: fileUrl,
    };

    return this.create(createDto);
  }

  async findAll(): Promise<MissionEvidence[]> {
    return this.missionEvidenceRepository.find({
      relations: ['mission', 'user'],
    });
  }

  async findOne(id: string): Promise<MissionEvidence> {
    const evidence = await this.missionEvidenceRepository.findOne({
      where: { id },
      relations: ['mission', 'user'],
    });
    if (!evidence) {
      throw new NotFoundException('Evidencia de misión no encontrada');
    }
    return evidence;
  }

  async update(
    id: string,
    updateMissionEvidenceDto: UpdateMissionEvidenceDto,
  ): Promise<MissionEvidence> {
    const evidence = await this.missionEvidenceRepository.findOne({
      where: { id },
      relations: ['mission', 'user'],
    });
    if (!evidence) {
      throw new NotFoundException('Evidencia de misión no encontrada');
    }

    if (updateMissionEvidenceDto.missionId) {
      const mission = await this.regularMissionRepository.findOneBy({
        id: updateMissionEvidenceDto.missionId,
      });
      if (!mission) {
        throw new NotFoundException('Misión no encontrada');
      }
      evidence.mission = mission;
    }

    if (updateMissionEvidenceDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updateMissionEvidenceDto.userId,
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      evidence.user = user;
    }

    if (updateMissionEvidenceDto.description !== undefined) {
      evidence.description = updateMissionEvidenceDto.description;
    }

    if (updateMissionEvidenceDto.fileUrl !== undefined) {
      evidence.fileUrl = updateMissionEvidenceDto.fileUrl;
    }

    return this.missionEvidenceRepository.save(evidence);
  }

  async remove(id: string): Promise<{ message: string }> {
    const evidence = await this.missionEvidenceRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!evidence) {
      throw new NotFoundException('Evidencia de misión no encontrada');
    }

    if (evidence.deletedAt) {
      throw new BadRequestException('Evidencia de misión ya está eliminada');
    }

    await this.missionEvidenceRepository.softDelete(id);
    return { message: 'Evidencia de misión eliminada exitosamente' };
  }

  async restore(id: string): Promise<{ message: string }> {
    const evidence = await this.missionEvidenceRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!evidence) {
      throw new NotFoundException('Evidencia de misión no encontrada');
    }

    if (!evidence.deletedAt) {
      throw new BadRequestException('Evidencia de misión ya está restaurada');
    }

    await this.missionEvidenceRepository.restore(id);
    return { message: 'Evidencia de misión restaurada exitosamente' };
  }

  async findByMission(missionId: string): Promise<MissionEvidence[]> {
    return this.missionEvidenceRepository.find({
      where: { mission: { id: missionId } },
      relations: ['mission', 'user'],
    });
  }

  async findByUser(userId: string): Promise<MissionEvidence[]> {
    return this.missionEvidenceRepository.find({
      where: { user: { id: userId } },
      relations: ['mission', 'user'],
    });
  }

  async findByMissionAndUser(
    missionId: string,
    userId: string,
  ): Promise<MissionEvidence[]> {
    return this.missionEvidenceRepository.find({
      where: {
        mission: { id: missionId },
        user: { id: userId },
      },
      relations: ['mission', 'user'],
    });
  }
}
