import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';

@Injectable()
export class SettingsService implements OnModuleInit {
    private settingsUpdatedSource = new Subject<void>();
    settingsUpdated$ = this.settingsUpdatedSource.asObservable();

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    async onModuleInit() {
        // Garantir que as configurações padrão existam
        const settings = await this.prisma.systemSettings.findUnique({
            where: { id: 'default' },
        });

        if (!settings) {
            await this.prisma.systemSettings.create({
                data: {
                    id: 'default',
                    syncInterval: 60,
                    brgpsToken: this.configService.get('BRGPS_API_TOKEN') || '',
                    traccarUrl: this.configService.get('TRACCAR_BASE_URL') || '',
                    traccarToken: this.configService.get('TRACCAR_API_TOKEN') || '',
                },
            });
        }
    }

    async getSettings() {
        return this.prisma.systemSettings.findUnique({
            where: { id: 'default' },
        });
    }

    async updateSettings(data: {
        syncInterval?: number;
        brgpsToken?: string;
        traccarUrl?: string;
        traccarToken?: string;
    }) {
        const settings = await this.prisma.systemSettings.update({
            where: { id: 'default' },
            data,
        });
        this.settingsUpdatedSource.next();
        return settings;
    }
}
