import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrmModule } from '@agh/orm';
import { LogModule } from '@agh/shared/log/log.module';
import { CommandModule } from './commands/commands.module';
import { HealthController } from './health/health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ListCmdModule } from './commands/list/list.module';
import { JoinedModule } from './event/joined/joined.module';
import { HelpCmdModule } from './commands/help/help.module';

@Module({
  imports: [
    OrmModule,
    LogModule,
    CommandModule,
    TerminusModule,
    ListCmdModule,
    JoinedModule,
    HelpCmdModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, CommandModule],
})
export class AppModule {}
