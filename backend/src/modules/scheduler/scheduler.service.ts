import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SyncService } from '../sync/sync.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly JOB_NAME = 'sync-job';
  private readonly CLEANUP_JOB_NAME = 'cleanup-job';
  private readonly DEFAULT_SYNC_INTERVAL = 60; // 60 segundos

  constructor(
    private syncService: SyncService,
    private schedulerRegistry: SchedulerRegistry,
  ) { }

  async onModuleInit() {
    // Iniciar jobs com intervalo padrão
    await this.startSyncJob(this.DEFAULT_SYNC_INTERVAL);
    this.startCleanupJob();
  }

  async startSyncJob(seconds: number) {
    this.stopSyncJob();

    this.logger.log(
      `Iniciando job de sincronização com intervalo de ${seconds}s`,
    );

    const interval = setInterval(async () => {
      await this.handleSync();
    }, seconds * 1000);

    this.schedulerRegistry.addInterval(this.JOB_NAME, interval);
  }

  stopSyncJob() {
    try {
      this.schedulerRegistry.deleteInterval(this.JOB_NAME);
    } catch (e) {
      // Ignorar se não existir
    }
  }

  startCleanupJob() {
    // Rodar a cada 24 horas
    const oneDayMs = 24 * 60 * 60 * 1000;

    this.logger.log('Iniciando job de limpeza diária (retenção de 7 dias)');

    const interval = setInterval(async () => {
      try {
        await this.syncService.cleanupOldData(7);
      } catch (error) {
        this.logger.error(`Erro no job de limpeza: ${error.message}`);
      }
    }, oneDayMs);

    this.schedulerRegistry.addInterval(this.CLEANUP_JOB_NAME, interval);

    // Rodar uma vez no início (após 1 minuto para não pesar o startup)
    setTimeout(async () => {
      try {
        await this.syncService.cleanupOldData(7);
      } catch (error) {
        this.logger.error(`Erro no cleanup inicial: ${error.message}`);
      }
    }, 60000);
  }

  async handleSync() {
    this.logger.log('Iniciando job de sincronização automática');
    try {
      const results = await this.syncService.syncAllTags();
      const successCount = results.filter((r) => r.success).length;
      this.logger.log(
        `Sincronização concluída: ${successCount}/${results.length} tags`,
      );
    } catch (error) {
      this.logger.error(`Erro no job de sincronização: ${error.message}`);
    }
  }
}
