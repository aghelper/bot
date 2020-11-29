import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import {
  ClientRepository,
  GuildRepository,
  GuildMemberRepository,
  ServiceRepository,
  MemberHistoryRepository,
} from '@agh/orm/repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
    }),
    TypeOrmModule.forFeature([
      ClientRepository,
      GuildRepository,
      GuildMemberRepository,
      ServiceRepository,
      MemberHistoryRepository,
    ]),
  ],
  exports: [
    TypeOrmModule.forFeature([
      ClientRepository,
      GuildRepository,
      GuildMemberRepository,
      ServiceRepository,
      MemberHistoryRepository,
    ]),
  ],
})
export class OrmModule {}
