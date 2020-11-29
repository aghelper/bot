import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { LogModule } from '@agh/shared/log/log.module';
import { JoinedModule } from './joined/joined.module';

@Module({
  imports: [LogModule, JoinedModule],
  providers: [EventService],
  exports: [JoinedModule],
})
export class EventModule {}
