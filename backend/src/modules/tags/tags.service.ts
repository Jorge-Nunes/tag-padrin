import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tag } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) { }

  async findAll(userId: string): Promise<Tag[]> {
    return await this.prisma.tag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
      include: {
        positions: { orderBy: { timestamp: 'desc' }, take: 10 },
        traccarLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!tag) throw new NotFoundException('Tag não encontrada ou acesso negado');
    return tag;
  }

  async create(userId: string, data: Partial<Tag>): Promise<Tag> {
    if (data.brgpsId) {
      const existing = await this.prisma.tag.findFirst({
        where: { brgpsId: data.brgpsId, userId },
      });

      if (existing) {
        throw new ConflictException(
          `Tag com ID BRGPS ${data.brgpsId} já cadastrada por você (Nome: ${existing.name})`,
        );
      }
    }

    try {
      return await this.prisma.tag.create({
        data: {
          ...data,
          userId,
        } as any,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Já existe uma tag com este ID BRGPS cadastrada em sua conta.`,
        );
      }
      throw error;
    }
  }

  async bulkCreate(userId: string, data: Partial<Tag>[]): Promise<{ count: number }> {
    const dataWithUser = data.map((t) => ({ ...t, userId }));
    return await this.prisma.tag.createMany({
      data: dataWithUser as any[],
      skipDuplicates: true,
    });
  }

  async update(userId: string, id: string, data: Partial<Tag>): Promise<Tag> {
    // Verificar se a tag pertence ao usuário antes de atualizar
    await this.findOne(userId, id);

    return await this.prisma.tag.update({
      where: { id },
      data: data as any,
    });
  }

  async remove(userId: string, id: string): Promise<Tag> {
    // Verificar se a tag pertence ao usuário antes de remover
    await this.findOne(userId, id);

    return await this.prisma.$transaction(async (tx) => {
      // Deletar registros dependentes manualmente para evitar erros de constraint em produção
      await tx.position.deleteMany({ where: { tag_id: id } as any }); // Prisma use @map
      await tx.traccarLog.deleteMany({ where: { tag_id: id } as any });
      await tx.syncLog.deleteMany({ where: { tag_id: id } as any });

      return await tx.tag.delete({ where: { id } });
    });
  }

  async getPositions(userId: string, tagId: string, limit: number = 20, page: number = 1, startDate?: string, endDate?: string) {
    await this.findOne(userId, tagId);

    const skip = (page - 1) * limit;
    
    const whereClause: any = { tagId };
    
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = new Date(startDate);
      if (endDate) whereClause.timestamp.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.position.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.position.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
