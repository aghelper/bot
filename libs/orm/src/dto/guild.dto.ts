import { CreateClientDTO } from './client.dto';
import { CreateServiceDTO } from './service.dto';
import { CreateGuildMemberDTO } from './guild-member.dto';
import { ClientEntity } from '../entity';

export class CreateGuildDTO {
  client: ClientEntity;
  services?: CreateServiceDTO[];
  guildMember?: CreateGuildMemberDTO[];
  inGameId: string;
  name: string;
  inGameAllyId: string;
  deathFame: number;
}
