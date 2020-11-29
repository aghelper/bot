import { ClientEntity, GuildEntity } from '../entity';

export class CreateServiceDTO {
  client: ClientEntity;
  guild: GuildEntity;
  name: string;
  description?: string;
  isActive: boolean;
  hookId: string;
  hookToken: string;
  ttl: Date;
}
