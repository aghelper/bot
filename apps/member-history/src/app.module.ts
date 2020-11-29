import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OrmModule } from '@agh/orm';
import { LogModule } from '@agh/shared/log/log.module';
import { HealthController } from './health/health.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ScheduleModule.forRoot(), OrmModule, LogModule, TerminusModule],
  controllers: [HealthController, AppController],
  providers: [AppService],
})
export class AppModule {}
