import { Repository, EntityRepository, Brackets } from 'typeorm';
import { ServiceEntity } from '../entity';
import { CreateServiceDTO } from '../dto';

@EntityRepository(ServiceEntity)
export class ServiceRepository extends Repository<ServiceEntity> {
  async getAll(): Promise<ServiceEntity[]> {
    return this.find();
  }

  async getAllActive(): Promise<ServiceEntity[]> {
    const services = await this.createQueryBuilder('services')
      .leftJoinAndSelect('services.guild', 'guild')
      .andWhere(`services.is_active = :active`, { active: true })
      .getMany();
    return services;
  }

  async getByClientId(clientId: string): Promise<ServiceEntity[]> {
    const services = await this.createQueryBuilder('services')
      .leftJoinAndSelect('services.client', 'client')
      .leftJoinAndSelect('services.guild', 'guild')
      .andWhere(`services.client = :id`, { id: clientId })
      .getMany();
    return services;
  }

  async createService(data: CreateServiceDTO): Promise<ServiceEntity> {
    let service = this.create({
      client: data.client,
      guild: data.guild,
      name: data.name,
      description: data.description,
      is_active: data.isActive,
      hook_id: data.hookId,
      hook_token: data.hookToken,
      ttl: data.ttl,
    });

    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      service = await queryRunner.manager.save(service);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
    return service;
  }
}
