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
  async findAll(): Promise<Tag[]> {
    return await this.tagsService.findAll();
  }

  @Post('bulk')
  async bulkCreate(@Body() data: any[]) {
    this.logger.log(`Solicitação de importação em massa: ${data.length} itens`);
    return await this.tagsService.bulkCreate(data);
  }

  @Post()
  async create(@Body() data: CreateTagDto): Promise<Tag> {
    return await this.tagsService.create(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tag> {
    return await this.tagsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateTagDto,
  ): Promise<Tag> {
    return await this.tagsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Tag> {
    return await this.tagsService.remove(id);
  }

  @Get(':id/positions')
  async getPositions(
    @Param('id') id: string,
    @Query('limit') limit: string,
  ): Promise<any[]> {
    return await this.tagsService.getPositions(id, parseInt(limit) || 100);
  }
}
