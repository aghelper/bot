import { Module } from '@nestjs/common';
import { OrmModule } from '@agh/orm';
import { ReportCmdService } from './report.service';
import { LogModule } from '@agh/shared/log/log.module';

@Module({
  imports: [OrmModule, LogModule],
  providers: [ReportCmdService],
  exports: [ReportCmdService],
})
export class ReportModule {}
