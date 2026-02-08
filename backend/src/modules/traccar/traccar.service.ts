import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TraccarService {
  private readonly logger = new Logger(TraccarService.name);
  private readonly traccarUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.traccarUrl = this.configService.get('TRACCAR_BASE_URL') || 'http://localhost:5055';
  }

  async sendPosition(position: any, tag: any) {
    // Mapear nível de bateria (0-3) para porcentagem (0-100)
    let batteryPercentage: number | undefined = undefined;
    const batteryLevel = position.rawData?.battery;
    if (batteryLevel !== undefined && batteryLevel !== -1) {
      if (batteryLevel === 3) batteryPercentage = 100;
      else if (batteryLevel === 2) batteryPercentage = 70;
      else if (batteryLevel === 1) batteryPercentage = 35;
      else if (batteryLevel === 0) batteryPercentage = 10;
    }

    try {
      // Converter para formato OSMAnd
      const payload = {
        id: tag.brgpsId,
        lat: position.latitude,
        lon: position.longitude,
        timestamp: Math.floor(new Date(position.timestamp).getTime() / 1000),
        speed: position.speed || 0,
        bearing: position.direction || 0,
        batt: batteryPercentage || 100,
      };

      this.logger.debug('Enviando para Traccar:', payload);

      // Enviar para Traccar
      const response = await axios.get(this.traccarUrl, {
        params: payload,
        timeout: 10000,
      });

      // Atualizar tag
      await this.prisma.tag.update({
        where: { id: tag.id },
        data: { lastTraccarSendAt: new Date() },
      });

      // Criar log
      await this.prisma.traccarLog.create({
        data: {
          tagId: tag.id,
          positionId: position.id,
          status: 'SUCCESS',
          payload: payload,
          response: response.data,
        },
      });

      this.logger.log(`Posicao enviada ao Traccar para tag ${tag.brgpsId}`);

      return { success: true, payload };

    } catch (error) {
      this.logger.error(`Erro ao enviar para Traccar: ${error.message}`);

      // Criar log de erro
      await this.prisma.traccarLog.create({
        data: {
          tagId: tag.id,
          positionId: position.id,
          status: 'ERROR',
          payload: position,
          response: error.message,
        },
      });

      throw error;
    }
  }

  async sendPendingPositions() {
    // Buscar posições não enviadas (últimas 24h)
    const positions = await this.prisma.position.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: { tag: true },
      take: 100,
    });

    const results: any[] = [];
    for (const position of positions) {
      try {
        const result = await this.sendPosition(position, position.tag);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  async getTraccarLogs(tagId?: string, limit: number = 50) {
    return this.prisma.traccarLog.findMany({
      where: tagId ? { tagId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { tag: true },
    });
  }
}
