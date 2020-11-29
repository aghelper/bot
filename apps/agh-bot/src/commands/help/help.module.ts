import { Module } from '@nestjs/common';
import { LogModule } from '@agh/shared/log/log.module';
import { HelpCmdService } from './help.service';

@Module({
  imports: [LogModule],
  providers: [HelpCmdService],
  exports: [HelpCmdService],
})
export class HelpCmdModule {}
