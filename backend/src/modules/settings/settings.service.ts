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
        // Garantir que as configurações padrão existam e estejam completas
        const settings = await this.prisma.systemSettings.findUnique({
            where: { id: 'default' },
        });

        if (!settings) {
            await this.prisma.systemSettings.create({
                data: {
                    id: 'default',
                    syncInterval: 60,
                    brgpsBaseUrl: this.configService.get('BRGPS_BASE_URL') || '',
                    brgpsToken: this.configService.get('BRGPS_API_TOKEN') || '',
                    traccarUrl: this.configService.get('TRACCAR_BASE_URL') || '',
                    traccarToken: this.configService.get('TRACCAR_API_TOKEN') || '',
                },
            });
        } else {
            // Verificar se as URLs de integração estão populadas (migração de segurança)
            const updates: any = {};
            if (!settings.brgpsBaseUrl) updates.brgpsBaseUrl = this.configService.get('BRGPS_BASE_URL') || '';
            if (!settings.brgpsToken) updates.brgpsToken = this.configService.get('BRGPS_API_TOKEN') || '';
            if (!settings.traccarUrl) updates.traccarUrl = this.configService.get('TRACCAR_BASE_URL') || '';
            if (!settings.traccarToken) updates.traccarToken = this.configService.get('TRACCAR_API_TOKEN') || '';

            if (Object.keys(updates).length > 0) {
                await this.prisma.systemSettings.update({
                    where: { id: 'default' },
                    data: updates,
                });
            }
        }
    }

    async getSettings() {
        return this.prisma.systemSettings.findUnique({
            where: { id: 'default' },
        });
    }

    async updateSettings(data: {
        syncInterval?: number;
        brgpsBaseUrl?: string;
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
