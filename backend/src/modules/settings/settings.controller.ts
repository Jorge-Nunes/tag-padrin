import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import axios from 'axios';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../prisma/prisma.service';

interface ServiceInfo {
  status: string;
  message: string;
  healthy: boolean;
}

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  private readonly serverStartTime: number;

  constructor(
    private settingsService: SettingsService,
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.serverStartTime = Date.now();
  }

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @SetMetadata('roles', ['ADMIN'])
  async updateSettings(@Body() data: UpdateSettingsDto) {
    try {
      return await this.settingsService.updateSettings(data);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  @Get('uptime')
  async getUptime() {
    const uptimeMs = Date.now() - this.serverStartTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);

    return {
      uptime: {
        days: uptimeDays,
        hours: uptimeHours % 24,
        minutes: uptimeMinutes % 60,
        seconds: uptimeSeconds % 60,
        totalSeconds: uptimeSeconds,
      },
      startedAt: new Date(this.serverStartTime).toISOString(),
    };
  }

  @Post('test-connection')
  async testConnection(
    @Body() data: { brgpsBaseUrl: string; brgpsToken: string },
  ) {
    try {
      if (!data.brgpsBaseUrl || !data.brgpsToken) {
        return {
          success: false,
          message: 'URL e Token são obrigatórios',
        };
      }

      // Faz uma chamada de teste à API BRGPS
      const testUrl = `${data.brgpsBaseUrl}/tag`;
      const response = await axios.get(testUrl, {
        params: { api_token: data.brgpsToken },
        timeout: 10000, // 10 segundos de timeout
      });

      if (response.status === 200) {
        return {
          success: true,
          message: 'Conexão estabelecida com sucesso',
        };
      } else {
        return {
          success: false,
          message: `API retornou status ${response.status}`,
        };
      }
    } catch (error: any) {
      console.error('Erro ao testar conexão BRGPS:', error.message);

      if (error.response) {
        // Erro com resposta do servidor
        return {
          success: false,
          message: `Erro na API: ${error.response.status} - ${error.response.statusText}`,
        };
      } else if (error.request) {
        // Erro de rede (sem resposta)
        return {
          success: false,
          message: 'Não foi possível conectar ao servidor. Verifique a URL.',
        };
      } else {
        // Outros erros
        return {
          success: false,
          message: `Erro: ${error.message}`,
        };
      }
    }
  }

  @Get('health')
  async getHealth() {
    const services: Record<string, ServiceInfo> = {
      api: { status: 'online', message: 'Operacional', healthy: true },
      database: {
        status: 'checking',
        message: 'Verificando...',
        healthy: false,
      },
      brgps: { status: 'checking', message: 'Verificando...', healthy: false },
      sync: { status: 'checking', message: 'Verificando...', healthy: false },
    };

    // Check Database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      services.database = {
        status: 'online',
        message: 'Conectado',
        healthy: true,
      };
    } catch (error: any) {
      services.database = {
        status: 'offline',
        message: `Erro: ${error.message}`,
        healthy: false,
      };
    }

    // Check BRGPS API
    try {
      const settings = await this.settingsService.getSettings();
      if (settings?.brgpsBaseUrl && settings?.brgpsToken) {
        const testUrl = `${settings.brgpsBaseUrl}/tag`;
        // Usando api_token em query params ou headers conforme suportado
        await axios.get(testUrl, {
          params: { api_token: settings.brgpsToken },
          timeout: 5000,
        });
        services.brgps = {
          status: 'online',
          message: 'Conectado',
          healthy: true,
        };
      } else {
        services.brgps = {
          status: 'offline',
          message: 'URL ou Token não configurado',
          healthy: false,
        };
      }
    } catch (error: any) {
      services.brgps = {
        status: 'offline',
        message:
          error.response?.status === 401
            ? 'Token inválido'
            : 'API indisponível',
        healthy: false,
      };
    }

    // Check Sync Service (Scheduler)
    try {
      const intervals = this.schedulerRegistry.getIntervals();
      const syncJobRunning = intervals.includes('sync-job');
      if (syncJobRunning) {
        services.sync = {
          status: 'online',
          message: 'Em execução',
          healthy: true,
        };
      } else {
        services.sync = {
          status: 'offline',
          message: 'Job não iniciado',
          healthy: false,
        };
      }
    } catch (error: any) {
      services.sync = {
        status: 'offline',
        message: 'Serviço não disponível',
        healthy: false,
      };
    }

    const allOnline =
      services.database.healthy &&
      services.brgps.healthy &&
      services.sync.healthy;

    return {
      status: allOnline ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };
  }
}
