import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../../prisma/prisma.module';

import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, ConfigModule],
    providers: [SettingsService],
    controllers: [SettingsController],
    exports: [SettingsService],
})
export class SettingsModule { }
