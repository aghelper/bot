import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';
import { OrmModule } from '@agh/orm';
import { StatusModule } from './status/status.module';
import { ListCmdModule } from './list/list.module';
import { HelpCmdModule } from './help/help.module';

@Module({
  imports: [
    RegisterModule,
    OrmModule,
    OrmModule,
    StatusModule,
    ListCmdModule,
    HelpCmdModule,
  ],
  exports: [RegisterModule, StatusModule, ListCmdModule, HelpCmdModule],
})
export class CommandModule {}
