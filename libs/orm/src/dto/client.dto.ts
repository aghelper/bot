import { CreateGuildDTO } from './guild.dto';
import { CreateServiceDTO } from './service.dto';

export class CreateClientDTO {
  discordId: string;
  discordName: string;
  isActive: boolean;
  guild?: CreateGuildDTO[];
  service?: CreateServiceDTO[];
}

export class ClientWhereDiscordIdDTO {
  discordId: string;
}
