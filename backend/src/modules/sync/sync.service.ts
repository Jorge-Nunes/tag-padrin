import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

interface BRGPSPosition {
  lat?: string | number;
  latitude?: string | number;
  lon?: string | number;
  longitude?: string | number;
  lng?: string | number;
  speed?: string | number;
  direction?: string | number;
  timestamp?: number;
  battery?: number;
}

interface TagData {
  id: string;
  brgpsId: string;
  status: string;
  traccarUrl?: string;
}

export interface SyncResult {
  tagId: string;
  success: boolean;
  position?: any;
  error?: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private configService: ConfigService,
  ) {}

  async syncAllTags(): Promise<SyncResult[]> {
    const settings = await this.settingsService.getSettings();
    const brgpsBaseUrl = settings?.brgpsBaseUrl;
    const brgpsToken = settings?.brgpsToken;

    if (!brgpsBaseUrl || !brgpsToken) {
      this.logger.error(
        'Configurações da BRGPS ausentes para sincronização global',
      );
      return [];
    }

    const tags = (await this.prisma.tag.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, brgpsId: true, status: true, traccarUrl: true },
    })) as TagData[];

    this.logger.log(`Iniciando sincronização otimizada de ${tags.length} tags`);
    const startTime = Date.now();

    const chunkSize = 20;
    const results: SyncResult[] = [];

    for (let i = 0; i < tags.length; i += chunkSize) {
      const chunk = tags.slice(i, i + chunkSize);
      const brgpsIds = chunk.map((t) => t.brgpsId).join(',');

      try {
        const url = `${brgpsBaseUrl}/tag?ids=${brgpsIds}`;
        const headers = {
          api_token: brgpsToken,
          timestamp: Math.floor(Date.now() / 1000).toString(),
          'Content-Type': 'application/json',
        };

        const response = await axios.get(url, { headers, timeout: 15000 });
        const batchData = this.normalizeBatchResponse(response.data);

        const chunkResults: SyncResult[] = [];
        for (const tag of chunk) {
          const tagInfo = batchData.find(
            (d: any) => String(d.id) === String(tag.brgpsId),
          );
          if (!tagInfo) {
            chunkResults.push({
              tagId: tag.id,
              success: false,
              error: 'Dispositivo não encontrado na resposta do lote',
            });
            continue;
          }
          const result = await this.processTagUpdate(tag, tagInfo);
          chunkResults.push(result);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        results.push(...chunkResults);
      } catch (error: any) {
        this.logger.error(`Erro ao processar lote de tags: ${error.message}`);
        results.push(
          ...chunk.map((t) => ({
            tagId: t.id,
            success: false,
            error: `Erro no lote: ${error.message}`,
          })),
        );
      }
    }

    const durationMs = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;
    const status = failedCount === 0 ? 'SUCCESS' : successCount > 0 ? 'PARTIAL' : 'FAILED';

    await this.prisma.syncOperation.create({
      data: {
        totalTags: tags.length,
        successCount,
        failedCount,
        durationMs,
        status,
        message: `Sincronização manual: ${successCount} sucesso, ${failedCount} falhas`,
      },
    });

    this.logger.log(`Sincronização finalizada em ${durationMs}ms: ${successCount} sucesso, ${failedCount} falhas`);

    return results;
  }

  private normalizeBatchResponse(data: any): any[] {
    if (data && data.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && !Array.isArray(data)) return [data];
    return [];
  }

  private async processTagUpdate(
    tag: TagData,
    positionData: BRGPSPosition,
  ): Promise<SyncResult> {
    try {
      if (!positionData || (!positionData.lat && !positionData.latitude)) {
        throw new Error('Dados de posição inválidos');
      }

      const latRaw = positionData.lat || positionData.latitude;
      const lonRaw =
        positionData.lon || positionData.lng || positionData.longitude;

      const lat =
        typeof latRaw === 'string' ? parseFloat(latRaw) : (latRaw as number);
      const lon =
        typeof lonRaw === 'string' ? parseFloat(lonRaw) : (lonRaw as number);
      const timestampMs = positionData.timestamp
        ? positionData.timestamp * 1000
        : Date.now();

      // Transação para consistência e performance
      const [position] = await this.prisma.$transaction([
        this.prisma.position.create({
          data: {
            tag: { connect: { id: tag.id } },
            latitude: lat,
            longitude: lon,
            speed: positionData.speed
              ? typeof positionData.speed === 'string'
                ? parseFloat(positionData.speed)
                : positionData.speed
              : null,
            direction: positionData.direction
              ? typeof positionData.direction === 'string'
                ? parseInt(positionData.direction)
                : positionData.direction
              : null,
            timestamp: new Date(timestampMs),
            rawData: positionData as any,
          },
        }),
        this.prisma.tag.update({
          where: { id: tag.id },
          data: {
            lastLatitude: lat,
            lastLongitude: lon,
            lastPositionAt: new Date(timestampMs),
            lastSyncAt: new Date(),
          },
        }),
        this.prisma.syncLog.create({
          data: {
            tagId: tag.id,
            status: 'SUCCESS',
            brgpsResponse: positionData as any,
          },
        }),
      ]);

      try {
        await this.sendToTraccar(tag, position);
      } catch (e: any) {
        this.logger.error(`Erro Traccar ${tag.brgpsId}: ${e.message}`);
      }

      return { tagId: tag.id, success: true, position };
    } catch (error: any) {
      await this.prisma.syncLog.create({
        data: { tagId: tag.id, status: 'ERROR', message: error.message },
      });
      return { tagId: tag.id, success: false, error: error.message };
    }
  }

  async syncTag(tag: TagData): Promise<SyncResult> {
    try {
      const settings = await this.settingsService.getSettings();
      const brgpsBaseUrl = settings?.brgpsBaseUrl;
      const brgpsToken = settings?.brgpsToken;

      if (!brgpsBaseUrl || !brgpsToken) {
        throw new Error('Configurações da BRGPS ausentes no banco de dados');
      }

      const url = `${brgpsBaseUrl}/tag?ids=${tag.brgpsId}`;

      const headers = {
        api_token: brgpsToken,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        'Content-Type': 'application/json',
      };

      const response = await axios.get(url, { headers, timeout: 10000 });
      let positionData: BRGPSPosition;

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        if (response.data.data.length === 0) {
          throw new Error(
            'Nenhuma posição retornada pela BRGPS (array data vazio)',
          );
        }
        positionData = response.data.data[0];
      } else if (Array.isArray(response.data)) {
        if (response.data.length === 0) {
          throw new Error('Nenhuma posição retornada pela BRGPS (array vazio)');
        }
        positionData = response.data[0];
      } else if (
        response.data &&
        typeof response.data === 'object' &&
        response.data !== null
      ) {
        if (response.data.statusCode && response.data.statusCode !== 200) {
          throw new Error(
            `Erro na API BRGPS: ${
              response.data.message || 'Status ' + response.data.statusCode
            }`,
          );
        }
        positionData = response.data as BRGPSPosition;
      } else {
        throw new Error(
          `Formato de resposta inesperado: ${typeof response.data}`,
        );
      }

      if (!positionData || (!positionData.lat && !positionData.latitude)) {
        throw new Error(
          `Dados de posição inválidos ou incompletos: ${JSON.stringify(
            positionData,
          )}`,
        );
      }

      // Normalizar campos
      const latRaw = positionData.lat || positionData.latitude;
      const lonRaw =
        positionData.lon || positionData.lng || positionData.longitude;

      if (latRaw === undefined || lonRaw === undefined) {
        return {
          tagId: tag.id,
          success: false,
          error: 'Dados de latitude/longitude ausentes',
        };
      }

      const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw;
      const lon = typeof lonRaw === 'string' ? parseFloat(lonRaw) : lonRaw;

      const timestampMs = positionData.timestamp
        ? positionData.timestamp * 1000
        : Date.now();

      const position = await this.prisma.position.create({
        data: {
          tag: { connect: { id: tag.id } },
          latitude: lat,
          longitude: lon,
          speed: positionData.speed
            ? typeof positionData.speed === 'string'
              ? parseFloat(positionData.speed)
              : positionData.speed
            : null,
          direction: positionData.direction
            ? typeof positionData.direction === 'string'
              ? parseInt(positionData.direction)
              : positionData.direction
            : null,
          timestamp: new Date(timestampMs),
          rawData: positionData as any,
        },
      });

      await this.prisma.tag.update({
        where: { id: tag.id },
        data: {
          lastLatitude: position.latitude,
          lastLongitude: position.longitude,
          lastSpeed: position.speed,
          lastDirection: position.direction,
          lastPositionAt: position.timestamp,
          lastSyncAt: new Date(),
        },
      });

      await this.prisma.syncLog.create({
        data: {
          tagId: tag.id,
          status: 'SUCCESS',
          brgpsResponse: positionData as any,
        },
      });

      this.logger.log(`Tag ${tag.brgpsId} sincronizada com sucesso`);

      try {
        await this.sendToTraccar(tag, position);
      } catch (traccarError) {
        this.logger.error(
          `Erro ao enviar para Traccar: ${traccarError.message}`,
        );
      }

      return {
        tagId: tag.id,
        success: true,
        position,
      };
    } catch (error) {
      await this.prisma.syncLog.create({
        data: {
          tagId: tag.id,
          status: 'ERROR',
          message: error.message,
        },
      });

      throw error;
    }
  }

  async sendToTraccar(tag: TagData, position: any) {
    const traccarBaseUrl = tag.traccarUrl;

    if (!traccarBaseUrl) {
      this.logger.debug(
        `Tag ${tag.brgpsId} não possui URL do Traccar configurada. Pulando envio.`,
      );
      return;
    }

    // Validar coordenadas
    if (!position.latitude || !position.longitude) {
      this.logger.warn(
        `Coordenadas inválidas para tag ${tag.brgpsId}. Pulando envio.`,
      );
      return;
    }

    const deviceId = String(tag.brgpsId);
    const batteryLevel = this.calculateBatteryPercentage(
      position.rawData?.battery,
    );
    const timestamp =
      position.timestamp instanceof Date
        ? position.timestamp.toISOString()
        : new Date(position.timestamp).toISOString();
    const speedKnots = (position.speed || 0) * 0.539957;

    const params: any = {
      id: deviceId,
      lat: position.latitude,
      lon: position.longitude,
      timestamp,
      speed: speedKnots,
      bearing: position.direction || 0,
      valid: true,
    };

    if (batteryLevel !== undefined) {
      params.batt = batteryLevel;
    }

    try {
      this.logger.debug(`Enviando para Traccar: ${JSON.stringify(params)}`);
      const queryString = Object.keys(params)
        .filter((key) => params[key] !== undefined)
        .map((key) => `${key}=${params[key]}`)
        .join('&');

      const fullUrl = `${traccarBaseUrl}?${queryString}`;
      this.logger.debug(`URL completa: ${fullUrl}`);

      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TagPadrin/1.0',
          Accept: '*/*',
        },
      });

      this.logger.log(
        `Dados enviados para Traccar com sucesso: Tag ${tag.brgpsId} (Status: ${response.status})`,
      );
    } catch (error: any) {
      await this.handleTraccarError(error, tag, params, traccarBaseUrl);
    }
  }

  private async handleTraccarError(
    error: any,
    tag: TagData,
    params: any,
    traccarBaseUrl: string,
  ): Promise<void> {
    const responseData = error.response?.data;
    const responseStatus = error.response?.status;
    const responseStatusText = error.response?.statusText;

    this.logger.error(
      `Falha ao enviar para Traccar (Tag ${tag.brgpsId}): ${error.message}`,
    );
    this.logger.error(
      `Detalhes do erro - Status: ${responseStatus} ${responseStatusText}, Resposta: ${JSON.stringify(responseData)}`,
    );
    this.logger.error(`Payload enviado: ${JSON.stringify(params)}`);

    if (params.batt !== undefined) {
      await this.retryWithoutBattery(params, tag, traccarBaseUrl);
    }

    throw error;
  }

  private async retryWithoutBattery(
    params: any,
    tag: TagData,
    traccarBaseUrl: string,
  ): Promise<void> {
    this.logger.warn(
      `Tentando enviar sem campo batt para tag ${tag.brgpsId}...`,
    );
    const paramsWithoutBatt = { ...params };
    delete paramsWithoutBatt.batt;

    try {
      const queryStringRetry = Object.keys(paramsWithoutBatt)
        .filter((key) => paramsWithoutBatt[key] !== undefined)
        .map((key) => `${key}=${paramsWithoutBatt[key]}`)
        .join('&');

      const fullUrlRetry = `${traccarBaseUrl}?${queryStringRetry}`;

      const retryResponse = await axios.get(fullUrlRetry, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TagPadrin/1.0',
          Accept: '*/*',
        },
      });
      this.logger.log(
        `Sucesso ao enviar sem batt: Tag ${tag.brgpsId} (Status: ${retryResponse.status})`,
      );
    } catch (retryError: any) {
      this.logger.error(`Falha sem batt também: ${retryError.message}`);
    }
  }

  private calculateBatteryPercentage(
    batteryLevel: number | undefined,
  ): number | undefined {
    if (batteryLevel === undefined || batteryLevel === -1) {
      return undefined;
    }
    if (batteryLevel === 3) return 100;
    if (batteryLevel === 2) return 70;
    if (batteryLevel === 1) return 35;
    if (batteryLevel === 0) return 10;
    return undefined;
  }

  async getSyncLogs(tagId?: string, limit: number = 50): Promise<any> {
    return await this.prisma.syncLog.findMany({
      where: tagId ? { tagId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { tag: true },
    });
  }

  async getSyncHistory(limit: number = 50): Promise<any> {
    return await this.prisma.syncOperation.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async cleanupOldData(daysRetention: number = 7) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - daysRetention);

    this.logger.log(
      `Limpando dados mais antigos que ${daysRetention} dias (${expirationDate.toISOString()})`,
    );

    try {
      const syncLogsDeleted = await this.prisma.syncLog.deleteMany({
        where: { createdAt: { lt: expirationDate } },
      });

      const traccarLogsDeleted = await this.prisma.traccarLog.deleteMany({
        where: { createdAt: { lt: expirationDate } },
      });

      const positionsDeleted = await this.prisma.position.deleteMany({
        where: { createdAt: { lt: expirationDate } },
      });

      this.logger.log(
        `Cleanup finalizado: ${syncLogsDeleted.count} SyncLogs, ${traccarLogsDeleted.count} TraccarLogs, ${positionsDeleted.count} Posições removidas.`,
      );

      return {
        syncLogsDeleted: syncLogsDeleted.count,
        traccarLogsDeleted: traccarLogsDeleted.count,
        positionsDeleted: positionsDeleted.count,
      };
    } catch (error: any) {
      this.logger.error(`Erro durante o cleanup: ${error.message}`);
      throw error;
    }
  }
}
