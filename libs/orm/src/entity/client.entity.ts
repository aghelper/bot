import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Unique,
  OneToMany,
  BaseEntity,
} from 'typeorm';

import { GuildEntity } from './guild.entity';
import { ServiceEntity } from './services.entity';

@Entity()
@Unique(['discord_id'])
export class ClientEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  discord_id: string;

  @Column()
  discord_name: string;

  @Column()
  is_active: boolean;

  @OneToMany(
    type => GuildEntity,
    guild => guild.id,
  )
  guilds: GuildEntity[];

  @OneToMany(
    type => ServiceEntity,
    service => service.client,
  )
  services: ServiceEntity[];
}
