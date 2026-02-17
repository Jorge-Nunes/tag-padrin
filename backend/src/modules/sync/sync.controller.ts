import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly syncService: SyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async manualSync() {
    this.logger.log('Sincronização manual solicitada via API');
    const result = await this.syncService.syncAllTags();
    return {
      message: 'Sincronização concluída',
      stats: {
        total: result.length,
        success: result.filter((r) => r.success).length,
        failed: result.filter((r) => !r.success).length,
      },
      details: result,
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getSyncHistory(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const history = await this.syncService.getSyncHistory(limitNum);
    return {
      data: history,
    };
  }
}
