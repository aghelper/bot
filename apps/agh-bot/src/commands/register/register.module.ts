import { Module } from '@nestjs/common';
import { OrmModule } from '@agh/orm';
import { RegisterCmdService } from './register.service';
import { LogModule } from '@agh/shared/log/log.module';

@Module({
  imports: [OrmModule, LogModule],
  providers: [RegisterCmdService],
  exports: [RegisterCmdService],
})
export class RegisterModule {}
