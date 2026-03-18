import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface UserCreateData {
  email: string;
  name?: string;
  password?: string;
  role: 'ADMIN' | 'OPERATOR';
}

interface UserUpdateData {
  email?: string;
  name?: string;
  password?: string;
  role?: 'ADMIN' | 'OPERATOR';
  isApproved?: boolean;
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isApproved: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(data: UserCreateData) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const password = data.password || '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        password: hashedPassword,
        isApproved: true,
      },
      select: userSelect,
    });
  }

  async update(id: string, data: UserUpdateData) {
    const updateData: Record<string, unknown> = {};

    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isApproved !== undefined) updateData.isApproved = data.isApproved;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: userSelect,
      });
    } catch {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async changePassword(id: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { message: 'Senha alterada com sucesso' };
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return { message: 'Usuário removido com sucesso' };
    } catch {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}
