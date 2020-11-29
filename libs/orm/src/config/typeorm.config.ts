import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  ClientEntity,
  GuildEntity,
  GuildMemberEntity,
  ServiceEntity,
  MemberHistoryEntity,
} from '../entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    ClientEntity,
    GuildEntity,
    GuildMemberEntity,
    ServiceEntity,
    MemberHistoryEntity,
  ],
  synchronize: true, //recommend as false for production
  migrations: [__dirname + '../**/*.migration.ts'],
  subscribers: [__dirname + '/../**/*.subscriber.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
