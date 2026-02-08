import { Module } from '@nestjs/common';
import { TraccarService } from './traccar.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TraccarService],
  exports: [TraccarService],
})
export class TraccarModule {}
