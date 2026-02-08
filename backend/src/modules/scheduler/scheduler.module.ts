import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SyncModule } from '../sync/sync.module';
import { TraccarModule } from '../traccar/traccar.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SyncModule,
    TraccarModule,
    SettingsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule { }
