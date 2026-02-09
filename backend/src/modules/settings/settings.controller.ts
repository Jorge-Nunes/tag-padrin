import { Controller, Get, Put, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
    constructor(private settingsService: SettingsService) { }

    @Get()
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Put()
    @SetMetadata('roles', ['ADMIN'])
    async updateSettings(@Body() data: UpdateSettingsDto) {
        return this.settingsService.updateSettings(data);
    }
}
