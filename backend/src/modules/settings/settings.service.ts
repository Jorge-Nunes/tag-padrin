import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Subject } from 'rxjs';

@Injectable()
export class SettingsService {
  private settingsUpdatedSource = new Subject<void>();
  settingsUpdated$ = this.settingsUpdatedSource.asObservable();

  constructor(private prisma: PrismaService) { }

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        syncInterval: true,
        brgpsBaseUrl: true,
        brgpsToken: true,
        traccarUrl: true,
        traccarToken: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updateSettings(
    userId: string,
    data: {
      syncInterval?: number;
      brgpsBaseUrl?: string;
      brgpsToken?: string;
      traccarUrl?: string;
      traccarToken?: string;
      name?: string;
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        syncInterval: true,
        brgpsBaseUrl: true,
        brgpsToken: true,
        traccarUrl: true,
        traccarToken: true,
      },
    });

    this.settingsUpdatedSource.next();
    return user;
  }
}
