import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly syncService: SyncService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async manualSync(@Req() req) {
    const userId = req.user.userId; // No JwtStrategy o ID vem como userId
    if (!userId) {
      this.logger.error('Tentativa de sincronização manual sem userId no token');
      return { message: 'Erro de autenticação: ID do usuário ausente' };
    }

    this.logger.log(`Sincronização manual solicitada para o usuário: ${userId}`);
    const result = await this.syncService.syncAllTags(userId);
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
  async getSyncHistory(@Req() req, @Query('limit') limit?: string) {
    const userId = req.user.userId; // No JwtStrategy o ID vem como userId
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const history = await this.syncService.getSyncHistory(userId, limitNum);
    return {
      data: history,
    };
  }
}
