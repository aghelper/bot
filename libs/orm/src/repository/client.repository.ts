import { Repository, EntityRepository } from 'typeorm';
import { ClientEntity } from '../entity';
import { CreateClientDTO, ClientWhereDiscordIdDTO } from '../dto/client.dto';

@EntityRepository(ClientEntity)
export class ClientRepository extends Repository<ClientEntity> {
  async getAll(): Promise<ClientEntity[]> {
    return this.find();
  }

  async getAllActive(): Promise<ClientEntity[]> {
    const clients = await this.createQueryBuilder('clients')
      .where(`clients.is_active = :active`, { active: true })
      .getMany();
    return clients;
  }

  async getClientByDiscordId(
    data: ClientWhereDiscordIdDTO,
  ): Promise<ClientEntity> {
    const { discordId } = data;
    try {
      const client = await this.createQueryBuilder('client')
        .where(`client.discord_id = :discordId`, { discordId })
        .getOne();
      return client;
    } catch (err) {
      throw new Error(err);
    }
  }

  async createClient(data: CreateClientDTO): Promise<ClientEntity> {
    const { discordId, ...clientData } = data;

    const exist = await this.createQueryBuilder('client')
      .where(`client.discord_id = :discordId`, { discordId })
      .getOne();

    if (exist) {
      return exist;
    } else {
      let client = this.create({
        is_active: clientData.isActive,
        discord_id: discordId,
        discord_name: clientData.discordName,
      });

      const queryRunner = this.manager.connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        client = await queryRunner.manager.save(client);
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new Error(err);
      } finally {
        await queryRunner.release();
      }
      return client;
    }
  }
}
