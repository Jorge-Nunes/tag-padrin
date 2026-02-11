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
  ) { }

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
      select: { id: true, brgpsId: true, status: true },
    })) as TagData[];

    this.logger.log(`Iniciando sincronização otimizada de ${tags.length} tags`);

    const chunkSize = 20; // Aumentado para melhor performance
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

        // Processar os resultados do lote sequencialmente para não sobrecarregar o Traccar
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
          // Pequeno delay entre envios para não sobrecarregar o Traccar
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        results.push(...chunkResults);
      } catch (error: any) {
        this.logger.error(`Erro ao processar lote de tags: ${error.message}`);
        // Em caso de erro no lote, tentamos registrar o erro para todas as tags do lote
        results.push(
          ...chunk.map((t) => ({
            tagId: t.id,
            success: false,
            error: `Erro no lote: ${error.message}`,
          })),
        );
      }
    }

    return results;
  }

  private normalizeBatchResponse(data: any): any[] {
    if (data && data.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && !Array.isArray(data)) return [data];
    return [];
  }

  private async processTagUpdate(tag: TagData, positionData: BRGPSPosition): Promise<SyncResult> {
    try {
      if (!positionData || (!positionData.lat && !positionData.latitude)) {
        throw new Error('Dados de posição inválidos');
      }

      const latRaw = positionData.lat || positionData.latitude;
      const lonRaw = positionData.lon || positionData.lng || positionData.longitude;

      const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : latRaw as number;
      const lon = typeof lonRaw === 'string' ? parseFloat(lonRaw) : lonRaw as number;
      const timestampMs = positionData.timestamp ? positionData.timestamp * 1000 : Date.now();

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
            `Erro na API BRGPS: ${response.data.message || 'Status ' + response.data.statusCode
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
      const lonRaw = positionData.lon || positionData.lng || positionData.longitude;

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
        this.logger.error(`Erro ao enviar para Traccar: ${traccarError.message}`);
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

  private async ensureDeviceInTraccar(tag: TagData, traccarApiUrl: string, traccarToken: string): Promise<boolean> {
    try {
      // Verificar se o dispositivo já existe no Traccar
      const checkResponse = await axios.get(`${traccarApiUrl}/devices`, {
        params: { uniqueId: tag.brgpsId },
        headers: traccarToken ? { Authorization: `Bearer ${traccarToken}` } : undefined,
        timeout: 5000,
      });

      if (checkResponse.data && checkResponse.data.length > 0) {
        this.logger.debug(`Dispositivo ${tag.brgpsId} já existe no Traccar`);
        return true;
      }

      // Criar dispositivo no Traccar
      this.logger.log(`Criando dispositivo ${tag.brgpsId} no Traccar...`);
      const createResponse = await axios.post(
        `${traccarApiUrl}/devices`,
        {
          name: tag.name || `Tag ${tag.brgpsId}`,
          uniqueId: tag.brgpsId,
          status: 'active',
        },
        {
          headers: traccarToken ? { Authorization: `Bearer ${traccarToken}` } : undefined,
          timeout: 5000,
        }
      );

      if (createResponse.status === 200 || createResponse.status === 201) {
        this.logger.log(`Dispositivo ${tag.brgpsId} criado com sucesso no Traccar`);
        return true;
      }

      return false;
    } catch (error: any) {
      this.logger.error(`Erro ao verificar/criar dispositivo no Traccar: ${error.message}`);
      return false;
    }
  }

  async sendToTraccar(tag: TagData, position: any) {
    const settings = await this.settingsService.getSettings();
    const traccarBaseUrl = settings?.traccarUrl;

    if (!traccarBaseUrl) {
      this.logger.warn('TRACCAR_BASE_URL não configurado. Pulando envio para Traccar.');
      return;
    }

    // Validar coordenadas
    if (!position.latitude || !position.longitude) {
      this.logger.warn(`Coordenadas inválidas para tag ${tag.brgpsId}. Pulando envio.`);
      return;
    }

    // Traccar aceita ID numérico ou string, mas algumas versões têm limitações
    // Vamos garantir que o ID seja uma string válida
    const deviceId = String(tag.brgpsId);
    
    // Processar bateria - Traccar espera 0-100 ou não enviar
    let batt: number | undefined = undefined;
    const batteryLevel = position.rawData?.battery;
    if (batteryLevel !== undefined && batteryLevel !== -1) {
      if (batteryLevel === 3) batt = 100;
      else if (batteryLevel === 2) batt = 70;
      else if (batteryLevel === 1) batt = 35;
      else if (batteryLevel === 0) batt = 10;
    }

    // Timestamp em formato ISO 8601
    const timestamp = position.timestamp instanceof Date
      ? position.timestamp.toISOString()
      : new Date(position.timestamp).toISOString();

    // Velocidade em nós (knots) - Traccar geralmente espera knots
    // Se a API BRGPS retorna km/h, convertemos para knots (1 km/h = 0.539957 knots)
    const speedKmh = position.speed || 0;
    const speedKnots = speedKmh * 0.539957;

    const params: any = {
      id: deviceId,
      lat: position.latitude,
      lon: position.longitude,
      timestamp: timestamp,
      speed: speedKnots,
      bearing: position.direction || 0,
      valid: true,
    };

    // Só adicionar bateria se tiver valor válido
    if (batt !== undefined) {
      params.batt = batt;
    }

    try {
      this.logger.debug(`Enviando para Traccar: ${JSON.stringify(params)}`);
      
      const response = await axios.get(traccarBaseUrl, {
        params,
        timeout: 10000,
      });
      
      this.logger.log(
        `Dados enviados para Traccar com sucesso: Tag ${tag.brgpsId} (Status: ${response.status})`,
      );
    } catch (error: any) {
      const responseData = error.response?.data;
      const responseStatus = error.response?.status;
      const responseStatusText = error.response?.statusText;
      
      // Se erro 400, pode ser que o dispositivo não esteja cadastrado
      if (responseStatus === 400) {
        this.logger.warn(`Dispositivo ${tag.brgpsId} retornou erro 400. Verificando se precisa ser cadastrado...`);
        
        // Tentar cadastrar o dispositivo se tivermos a API REST configurada
        const traccarApiUrl = settings?.traccarUrl?.replace(/\/+$/, '').replace(/:\d+/, ':8082'); // Assumir API na porta 8082
        const traccarToken = settings?.traccarToken;
        
        if (traccarApiUrl && traccarToken) {
          const registered = await this.ensureDeviceInTraccar(tag, traccarApiUrl, traccarToken);
          if (registered) {
            this.logger.log(`Dispositivo ${tag.brgpsId} registrado. Tentando enviar novamente...`);
            // Tentar enviar novamente
            try {
              const retryResponse = await axios.get(traccarBaseUrl, {
                params,
                timeout: 10000,
              });
              this.logger.log(
                `Dados enviados para Traccar com sucesso (2ª tentativa): Tag ${tag.brgpsId} (Status: ${retryResponse.status})`,
              );
              return;
            } catch (retryError: any) {
              this.logger.error(`Falha na 2ª tentativa: ${retryError.message}`);
            }
          }
        } else {
          this.logger.error(`API REST do Traccar não configurada. Configure TRACCAR_URL (porta 8082) e TRACCAR_TOKEN para cadastrar dispositivos automaticamente.`);
        }
      }
      
      this.logger.error(
        `Falha ao enviar para Traccar (Tag ${tag.brgpsId}): ${error.message}`,
      );
      this.logger.error(
        `Detalhes do erro - Status: ${responseStatus} ${responseStatusText}, Resposta: ${JSON.stringify(responseData)}`,
      );
      this.logger.error(
        `Payload enviado: ${JSON.stringify(params)}`,
      );
      
      throw error;
    }
  }

  async getSyncLogs(tagId?: string, limit: number = 50): Promise<any> {
    return await this.prisma.syncLog.findMany({
      where: tagId ? { tagId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { tag: true },
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
