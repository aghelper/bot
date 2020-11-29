import { Module } from '@nestjs/common';
import { JoinedService } from './joined.service';
import { LogModule } from '@agh/shared/log/log.module';

@Module({
  imports: [LogModule],
  providers: [JoinedService],
  exports: [JoinedService],
})
export class JoinedModule {}
