import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GuildEntity } from './guild.entity';

@Entity()
export class GuildMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(
    type => GuildEntity,
    guild => guild.id,
  )
  guild: GuildEntity;

  @Column({ type: 'int', nullable: true })
  avg_ip: number;

  @Column()
  name: string;

  @Column()
  in_game_id: string;

  @Column({ nullable: true })
  ally_name: string;

  @Column({ nullable: true })
  ally_id: string;

  @Column({ nullable: true })
  ally_tag: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  avatar_ring: string;

  @Column({ type: 'bigint' })
  death_fame: number;

  @Column({ type: 'bigint' })
  kill_fame: number;

  @Column({ type: 'float8' })
  fame_ratio: number;

  @Column({ type: 'bigint' })
  pve_mobs: number;

  @Column({ type: 'bigint' })
  pve_total: number;

  @Column({ type: 'bigint' })
  pve_hellgate: number;

  @Column({ type: 'bigint' })
  gathering_fiber: number;

  @Column({ type: 'bigint' })
  gathering_hide: number;

  @Column({ type: 'bigint' })
  gathering_ore: number;

  @Column({ type: 'bigint' })
  gathering_rock: number;

  @Column({ type: 'bigint' })
  gathering_wood: number;

  @Column({ type: 'bigint' })
  gathering_total: number;

  @Column({ type: 'bigint' })
  crafting_total: number;

  @Column({ type: 'bigint' })
  crystal_league: number;

  @Column({ nullable: true })
  time_stemp: string;
}
