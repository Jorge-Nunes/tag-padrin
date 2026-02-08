import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tag } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<Tag[]> {
    return await this.prisma.tag.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        positions: { orderBy: { timestamp: 'desc' }, take: 10 },
        traccarLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!tag) throw new NotFoundException('Tag não encontrada');
    return tag;
  }

  async create(data: Partial<Tag>): Promise<Tag> {
    return await this.prisma.tag.create({ data: data as any });
  }

  async bulkCreate(data: Partial<Tag>[]): Promise<{ count: number }> {
    return await this.prisma.tag.createMany({
      data: data as any[],
      skipDuplicates: true,
    });
  }

  async update(id: string, data: Partial<Tag>): Promise<Tag> {
    return await this.prisma.tag.update({
      where: { id },
      data: data as any,
    });
  }

  async remove(id: string): Promise<Tag> {
    return await this.prisma.tag.delete({ where: { id } });
  }

  async getPositions(tagId: string, limit: number = 100) {
    return await this.prisma.position.findMany({
      where: { tagId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
