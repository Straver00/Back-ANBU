import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UploadReportDto } from './dto/upload-report.dto';
import { User } from '../users/entities/user.entity';
import { BountyMission } from '../bountyMissions/entities/bountyMission.entity';
import { RegularMission } from '../regularMissions/entities/regularMission.entity';
import { UserRole } from '../users/enum/userRole.enum';
import { ReportType } from './enum/reportType.enum';
import { ReportState } from './enum/reportState.enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BountyMission)
    private readonly bountyMissionRepository: Repository<BountyMission>,
    @InjectRepository(RegularMission)
    private readonly regularMissionRepository: Repository<RegularMission>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    // Validar que el usuario que reporta existe
    const user = await this.userRepository.findOneBy({
      id: createReportDto.userId,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar que el usuario reportado existe
    const traidor = await this.userRepository.findOneBy({
      id: createReportDto.traidorId,
    });
    if (!traidor) {
      throw new NotFoundException('Usuario reportado no encontrado');
    }

    // Validar que no se reporte a sí mismo
    if (createReportDto.userId === createReportDto.traidorId) {
      throw new BadRequestException('No puedes reportarte a ti mismo');
    }

    // Crear el reporte
    const report = this.reportRepository.create({
      user,
      traidor,
      typeReport: createReportDto.typeReport,
      description: createReportDto.description,
      fileUrl: createReportDto.fileUrl,
      state: ReportState.EN_PROCESO,
    });

    return this.reportRepository.save(report);
  }

  async uploadReport(
    uploadDto: UploadReportDto,
    file: Express.Multer.File,
  ): Promise<Report> {
    // Validar que el usuario que reporta existe
    const user = await this.userRepository.findOneBy({
      id: uploadDto.userId,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar que el usuario reportado existe
    const traidor = await this.userRepository.findOneBy({
      id: uploadDto.traidorId,
    });
    if (!traidor) {
      throw new NotFoundException('Usuario reportado no encontrado');
    }

    // Validar que no se reporte a sí mismo
    if (uploadDto.userId === uploadDto.traidorId) {
      throw new BadRequestException('No puedes reportarte a ti mismo');
    }

    // Subir archivo a Cloudinary
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
    const fileUrl = cloudinaryResponse.secure_url;

    // Crear el reporte con la URL de Cloudinary
    const createDto: CreateReportDto = {
      userId: uploadDto.userId,
      traidorId: uploadDto.traidorId,
      typeReport: uploadDto.typeReport,
      description: uploadDto.description,
      fileUrl: fileUrl,
    };

    return this.create(createDto);
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      relations: ['user', 'traidor'],
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'traidor'],
    });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'traidor'],
    });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    // Si se está cambiando el estado a APROBADO, ejecutar la lógica de negocio
    // O si ya está aprobado pero se proporciona una nueva reward
    if (
      updateReportDto.state === ReportState.APROBADO &&
      (report.state !== ReportState.APROBADO || updateReportDto.reward)
    ) {
      await this.processApprovedReport(report, updateReportDto.reward);
    }

    // Actualizar campos básicos
    if (updateReportDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updateReportDto.userId,
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      report.user = user;
    }

    if (updateReportDto.traidorId) {
      const traidor = await this.userRepository.findOneBy({
        id: updateReportDto.traidorId,
      });
      if (!traidor) {
        throw new NotFoundException('Usuario reportado no encontrado');
      }
      report.traidor = traidor;
    }

    if (updateReportDto.typeReport !== undefined) {
      report.typeReport = updateReportDto.typeReport;
    }

    if (updateReportDto.description !== undefined) {
      report.description = updateReportDto.description;
    }

    if (updateReportDto.fileUrl !== undefined) {
      report.fileUrl = updateReportDto.fileUrl;
    }

    if (updateReportDto.state !== undefined) {
      report.state = updateReportDto.state;
    }

    return this.reportRepository.save(report);
  }

  async updateWithDetails(
    id: string,
    updateReportDto: UpdateReportDto,
  ): Promise<{ report: Report; reassignedMissions?: any[] }> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'traidor'],
    });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    let reassignedMissions: any[] = [];

    // Si se está cambiando el estado a APROBADO, ejecutar la lógica de negocio
    // O si ya está aprobado pero se proporciona una nueva reward
    if (
      updateReportDto.state === ReportState.APROBADO &&
      (report.state !== ReportState.APROBADO || updateReportDto.reward)
    ) {
      const result = await this.processApprovedReport(
        report,
        updateReportDto.reward,
      );
      reassignedMissions = result.reassignedMissions || [];
    }

    // Actualizar campos básicos (resto del código del método update original)
    if (updateReportDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updateReportDto.userId,
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      report.user = user;
    }

    if (updateReportDto.traidorId) {
      const traidor = await this.userRepository.findOneBy({
        id: updateReportDto.traidorId,
      });
      if (!traidor) {
        throw new NotFoundException('Usuario reportado no encontrado');
      }
      report.traidor = traidor;
    }

    if (updateReportDto.typeReport !== undefined) {
      report.typeReport = updateReportDto.typeReport;
    }

    if (updateReportDto.description !== undefined) {
      report.description = updateReportDto.description;
    }

    if (updateReportDto.fileUrl !== undefined) {
      report.fileUrl = updateReportDto.fileUrl;
    }

    if (updateReportDto.state !== undefined) {
      report.state = updateReportDto.state;
    }

    const savedReport = await this.reportRepository.save(report);

    return {
      report: savedReport,
      ...(reassignedMissions.length > 0 && { reassignedMissions }),
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.reportRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Reporte no encontrado');
    }
  }

  async restore(id: string): Promise<void> {
    const result = await this.reportRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Reporte no encontrado');
    }
  }

  /**
   * Procesa un reporte cuando es aprobado
   * - Si es tipo POSIBLE_TRAIDOR: cambia el rol del usuario reportado a TRAIDOR y crea una bountyMission
   * - Si es tipo ASESINATO: verifica que el reportado sea traidor y marca la bountyMission como completada
   */
  private async processApprovedReport(
    report: Report,
    reward?: string,
  ): Promise<{ reassignedMissions?: any[] }> {
    if (report.typeReport === ReportType.POSIBLE_TRAIDOR) {
      const reassignedMissions = await this.processPossibleTraitorReport(
        report,
        reward,
      );
      return { reassignedMissions };
    } else if (report.typeReport === ReportType.ASESINATO) {
      await this.processAssassinationReport(report);
      return {};
    }
    return {};
  }

  /**
   * Procesa un reporte de posible traidor aprobado
   */
  private async processPossibleTraitorReport(
    report: Report,
    reward?: string,
  ): Promise<any[]> {
    const traidor = report.traidor;

    // Cambiar el rol del usuario reportado a TRAIDOR si aún no lo es
    if (traidor.role !== UserRole.TRAIDOR) {
      traidor.role = UserRole.TRAIDOR;
      await this.userRepository.save(traidor);
    }

    // Buscar misiones donde el traidor es capitán y cambiar el capitán
    const reassignedMissions = await this.reassignCaptainFromTraitor(
      traidor.id,
    );

    // Buscar la bounty mission para este traidor
    let bountyMission = await this.bountyMissionRepository.findOne({
      where: { traitor: { id: traidor.id } },
    });

    if (bountyMission) {
      // Si existe, actualiza la reward
      if (reward) {
        bountyMission.reward = reward;
        await this.bountyMissionRepository.save(bountyMission);
      }
      return reassignedMissions;
    }

    // Si no existe, crea una nueva bounty mission con la reward recibida
    bountyMission = this.bountyMissionRepository.create({
      traitor: traidor,
      reward: reward || `Recompensa por capturar al traidor ${traidor.alias}`,
    });

    await this.bountyMissionRepository.save(bountyMission);
    return reassignedMissions;
  }

  /**
   * Reasigna el capitán de las misiones regulares cuando alguien se convierte en traidor
   */
  private async reassignCaptainFromTraitor(traidorId: string): Promise<
    Array<{
      missionId: string;
      missionCodeName: string;
      oldCaptain: { id: string; alias: string; fullName: string };
      newCaptain: { id: string; alias: string; fullName: string };
    }>
  > {
    // Buscar misiones donde el traidor es capitán
    const missionsAsCaptain = await this.regularMissionRepository.find({
      where: { captain: { id: traidorId } },
      relations: ['captain'],
    });

    const reassignedMissions: Array<{
      missionId: string;
      missionCodeName: string;
      oldCaptain: { id: string; alias: string; fullName: string };
      newCaptain: { id: string; alias: string; fullName: string };
    }> = [];

    for (const mission of missionsAsCaptain) {
      const oldCaptain = { ...mission.captain };

      // Buscar agentes disponibles (no kage, no traidor)
      const availableAgents = await this.userRepository.find({
        where: {
          role: UserRole.AGENTE,
          active: true,
        },
      });

      if (availableAgents.length === 0) {
        throw new BadRequestException(
          `No hay agentes disponibles para ser capitán de la misión: ${mission.codeName}`,
        );
      }

      // Seleccionar un agente aleatorio
      const randomIndex = Math.floor(Math.random() * availableAgents.length);
      const newCaptain = availableAgents[randomIndex];

      // Actualizar la misión con el nuevo capitán
      mission.captain = newCaptain;
      await this.regularMissionRepository.save(mission);

      // Agregar información de la reasignación
      reassignedMissions.push({
        missionId: mission.id,
        missionCodeName: mission.codeName,
        oldCaptain: {
          id: oldCaptain.id,
          alias: oldCaptain.alias,
          fullName: oldCaptain.fullName,
        },
        newCaptain: {
          id: newCaptain.id,
          alias: newCaptain.alias,
          fullName: newCaptain.fullName,
        },
      });
    }

    return reassignedMissions;
  }

  /**
   * Procesa un reporte de asesinato aprobado
   */
  private async processAssassinationReport(report: Report): Promise<void> {
    const traidor = report.traidor;

    // Verificar que el usuario reportado sea efectivamente un traidor
    if (traidor.role !== UserRole.TRAIDOR) {
      throw new BadRequestException(
        'El usuario reportado no tiene el rol de traidor, no se puede procesar como asesinato',
      );
    }

    // Buscar la bounty mission activa para este traidor
    const bountyMission = await this.bountyMissionRepository.findOne({
      where: {
        traitor: { id: traidor.id },
        completedAt: IsNull(), // Solo bounty missions que no estén completadas
      },
      relations: ['traitor'],
    });

    if (!bountyMission) {
      throw new NotFoundException(
        'No se encontró una bounty mission activa para este traidor',
      );
    }

    // Marcar la bounty mission como completada
    bountyMission.completedAt = new Date();
    await this.bountyMissionRepository.save(bountyMission);
  }

  /**
   * Obtiene reportes por estado
   */
  async findByState(state: ReportState): Promise<Report[]> {
    return this.reportRepository.find({
      where: { state },
      relations: ['user', 'traidor'],
    });
  }

  /**
   * Obtiene reportes por tipo
   */
  async findByType(typeReport: ReportType): Promise<Report[]> {
    return this.reportRepository.find({
      where: { typeReport },
      relations: ['user', 'traidor'],
    });
  }

  /**
   * Obtiene reportes de un usuario específico (reportes creados por él)
   */
  async findByUser(userId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'traidor'],
    });
  }

  /**
   * Obtiene reportes sobre un usuario específico (reportes sobre él)
   */
  async findByTraidor(traidorId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { traidor: { id: traidorId } },
      relations: ['user', 'traidor'],
    });
  }

  /**
   * Obtiene las misiones donde un usuario es capitán
   */
  async getMissionsByCaptain(captainId: string) {
    return this.regularMissionRepository.find({
      where: { captain: { id: captainId } },
      relations: ['captain'],
    });
  }
}
