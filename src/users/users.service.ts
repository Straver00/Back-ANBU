import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('createUserDto', createUserDto);
    // Verificar si falta algun campo obligatorio
    if (
      !createUserDto.fullName ||
      !createUserDto.alias ||
      !createUserDto.email ||
      !createUserDto.password ||
      !createUserDto.role
    ) {
      throw new ConflictException('Faltan campos obligatorios.');
    }
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }],
    });
    if (existingUser) throw new ConflictException('El email ya está en uso.');
    const existingAlias = await this.userRepository.findOne({
      where: { alias: createUserDto.alias },
    });
    if (existingAlias) throw new ConflictException('El alias ya está en uso.');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user: User = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async restore(id: string): Promise<void> {
    const result = await this.userRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
