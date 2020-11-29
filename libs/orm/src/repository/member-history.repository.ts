import { EntityRepository, Repository } from 'typeorm';
import { MemberHistoryEntity } from '../entity/member-history.entity';
import { CreateMemberHistoryDTO, MemberWhereNameOrIdDTO } from '../dto';

@EntityRepository(MemberHistoryEntity)
export class MemberHistoryRepository extends Repository<MemberHistoryEntity> {
  async getAll(): Promise<MemberHistoryEntity[]> {
    return this.find();
  }

  async getAllHistoryOfAPlayer(
    data: MemberWhereNameOrIdDTO,
  ): Promise<MemberHistoryEntity[]> {
    const { inGameId, name } = data;
    if (inGameId) {
      const member = await this.createQueryBuilder('member')
        .where(`member.in_game_id = :id`, { id: inGameId })
        .getMany();
      return member;
    }
    const member = await this.createQueryBuilder('member')
      .where(`member.name = :nick`, { nick: name })
      .getMany();
    return member;
  }

  async createMemberHistory(
    data: CreateMemberHistoryDTO,
  ): Promise<MemberHistoryEntity> {
    let mh = this.create({
      guild_name: data.guildName,
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
      pve_hellgate: data.pve_hellgate,
      pve_mobs: data.pve_mobs,
      pve_total: data.pve_total,
      gathering_fiber: data.gatheringFiber,
      gathering_hide: data.gatheringHide,
      gathering_ore: data.gatheringOre,
      gathering_rock: data.gatheringRock,
      gathering_wood: data.gatheringWood,
      gathering_total: data.gatheringTotal,
      crystal_league: data.crystal_league,
      time_stemp: data.timeStemp,
      crafting_total: data.craftingTotal,
    });

    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      mh = await queryRunner.manager.save(mh);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
    return mh;
  }
}
