import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { LogModule } from './log/log.module';

@Module({
  imports: [LogModule],
  providers: [SharedService],
  exports: [SharedService, LogModule],
})
export class SharedModule {}
