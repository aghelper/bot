import { Module } from '@nestjs/common';
import { StatusCmdService } from './status.service';
import { LogModule } from '@agh/shared/log/log.module';

@Module({
  imports: [LogModule],
  providers: [StatusCmdService],
  exports: [StatusCmdService],
})
export class StatusModule {}
