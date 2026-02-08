import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface UserCreateData {
    email: string;
    name?: string;
    password?: string;
    role: 'ADMIN' | 'OPERATOR';
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
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

        const password = data.password || '123456'; // Senha padrão se não informada
        const hashedPassword = await bcrypt.hash(password, 10);

        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
    }

    async update(id: string, data: Partial<UserCreateData>) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        try {
            return await this.prisma.user.update({
                where: { id },
                data: {
                    email: data.email,
                    name: data.name,
                    role: data.role,
                    ...(data.password ? { password: data.password } : {}),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                },
            });
        } catch (error) {
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
        } catch (error) {
            throw new NotFoundException('Usuário não encontrado');
        }
    }
}
