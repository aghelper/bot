import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { ClientEntity } from './client.entity';
import { GuildEntity } from './guild.entity';

@Entity()
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(
    type => ClientEntity,
    client => client.services,
  )
  client: ClientEntity;

  @ManyToOne(
    type => GuildEntity,
    guild => guild.services,
  )
  guild: GuildEntity;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  is_active: boolean;

  @Column({ nullable: false })
  hook_id: string;

  @Column({ nullable: false })
  hook_token: string;

  @Column()
  ttl: Date;
}
