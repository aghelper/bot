import { Repository, EntityRepository } from 'typeorm';
import { GuildEntity } from '../entity';
import { CreateGuildDTO } from '../dto';

@EntityRepository(GuildEntity)
export class GuildRepository extends Repository<GuildEntity> {
  async getAll(): Promise<GuildEntity[]> {
    return this.find();
  }

  async getByGuildName(name: string): Promise<GuildEntity> {
    // const guild = await this.createQueryBuilder('guild')
    //   .where(`guild.name = :gname`, { gname: name })
    //   .getOne();
    // return guild;
    const guild = await this.createQueryBuilder('guild')
      .leftJoinAndSelect('guild.client', 'client')
      .andWhere(`guild.name = :gname`, { gname: name })
      .getOne();
    return guild;
  }

  async createGuild(data: CreateGuildDTO): Promise<GuildEntity> {
    let guild = this.create({
      name: data.name,
      client: data.client,
      services: data.services,
      in_game_id: data.inGameId,
      in_game_ally_id: data.inGameAllyId,
      death_fame: data.deathFame,
    });

    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      guild = await queryRunner.manager.save(guild);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
    return guild;
  }
}
