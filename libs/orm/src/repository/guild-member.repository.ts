import { Repository, EntityRepository } from 'typeorm';
import { GuildMemberEntity, GuildEntity } from '../entity';
import { CreateGuildMemberDTO } from '../dto';

@EntityRepository(GuildMemberEntity)
export class GuildMemberRepository extends Repository<GuildMemberEntity> {
  async getAll(): Promise<GuildMemberEntity[]> {
    return this.find();
  }

  async getAllByGuild(data: GuildEntity): Promise<GuildMemberEntity[]> {
    const members = await this.createQueryBuilder('members')
      .where(`members.guild = :id`, { id: data.id })
      .getMany();
    return members;
  }

  async deleteMember(data: GuildMemberEntity): Promise<void> {
    await this.remove(data);
  }

  async createGuildMember(
    data: CreateGuildMemberDTO,
  ): Promise<GuildMemberEntity> {
    let gm = this.create({
      guild: data.guild,
      avg_ip: data.avgIp,
      name: data.name,
      in_game_id: data.inGameId,
      ally_name: data.allyName,
      ally_id: data.allyId,
      ally_tag: data.allyTag,
      avatar: data.avatar,
      avatar_ring: data.avatarRing,
      death_fame: data.deathFame,
      kill_fame: data.killFame,
      fame_ratio: data.fameRatio,
      gathering_fiber: data.gatheringFiber,
      gathering_hide: data.gatheringHide,
      gathering_ore: data.gatheringOre,
      gathering_rock: data.gatheringRock,
      gathering_wood: data.gatheringWood,
      gathering_total: data.gatheringTotal,
      time_stemp: data.timeStemp,
      crystal_league: data.crystal_league,
      pve_hellgate: data.pve_hellgate,
      pve_mobs: data.pve_mobs,
      pve_total: data.pve_total,
      crafting_total: data.craftingTotal,
    });

    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      gm = await queryRunner.manager.save(gm);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
    return gm;
  }
}
