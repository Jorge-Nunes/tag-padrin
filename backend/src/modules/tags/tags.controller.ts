import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  Request,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tag } from '@prisma/client';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  private readonly logger = new Logger(TagsController.name);

  constructor(private tagsService: TagsService) { }

  @Get()
  async findAll(@Request() req: any): Promise<Tag[]> {
    return await this.tagsService.findAll(req.user.userId);
  }

  @Post('bulk')
  async bulkCreate(@Request() req: any, @Body() data: any[]) {
    this.logger.log(`Solicitação de importação em massa: ${data.length} itens (User: ${req.user.userId})`);
    return await this.tagsService.bulkCreate(req.user.userId, data);
  }

  @Post()
  async create(@Request() req: any, @Body() data: CreateTagDto): Promise<Tag> {
    return await this.tagsService.create(req.user.userId, data);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string): Promise<Tag> {
    return await this.tagsService.findOne(req.user.userId, id);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateTagDto,
  ): Promise<Tag> {
    return await this.tagsService.update(req.user.userId, id, data);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string): Promise<Tag> {
    return await this.tagsService.remove(req.user.userId, id);
  }

  @Get(':id/positions')
  async getPositions(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    return await this.tagsService.getPositions(
      req.user.userId, 
      id, 
      parseInt(limit) || 20,
      parseInt(page) || 1,
      startDate,
      endDate
    );
  }
}
