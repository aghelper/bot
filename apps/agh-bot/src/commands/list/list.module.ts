import { Module } from '@nestjs/common';
import { ListCmdService } from './list.service';
import { OrmModule } from '@agh/orm';
import { LogModule } from '@agh/shared/log/log.module';

@Module({
  imports: [OrmModule, LogModule],
  providers: [ListCmdService],
  exports: [ListCmdService],
})
export class ListCmdModule {}
