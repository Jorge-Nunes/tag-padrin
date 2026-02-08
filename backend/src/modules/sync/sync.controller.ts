import { Controller, Post, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
    private readonly logger = new Logger(SyncController.name);

    constructor(private readonly syncService: SyncService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    async manualSync() {
        this.logger.log('Sincronização manual solicitada via API');
        const result = await this.syncService.syncAllTags();
        return {
            message: 'Sincronização concluída',
            stats: {
                total: result.length,
                success: result.filter(r => r.success).length,
                failed: result.filter(r => !r.success).length
            },
            details: result
        };
    }
}
