import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClientEntity } from './client.entity';
import { ServiceEntity } from './services.entity';
import { GuildMemberEntity } from './guild-member.entity';

@Entity()
@Unique(['in_game_id'])
export class GuildEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(
    type => ClientEntity,
    client => client.guilds,
  )
  client: ClientEntity;

  @OneToMany(
    type => ServiceEntity,
    service => service.guild,
  )
  services: ServiceEntity[];

  @Column()
  in_game_id: string;

  @Column()
  name: string;

  @Column()
  in_game_ally_id: string;

  @Column({ type: 'bigint' })
  death_fame: number;
}
