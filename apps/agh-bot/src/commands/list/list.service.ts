import { Injectable } from '@nestjs/common';
import { LogService } from '@agh/shared/log/log.service';
import { ClientRepository, ServiceRepository } from '@agh/orm/repository';
import { Client, MessageEmbed } from 'discord.js';

@Injectable()
export class ListCmdService {
  constructor(
    private readonly logService: LogService,
    private readonly clientRepo: ClientRepository,
    private readonly servicesRepo: ServiceRepository,
  ) {}

  async addList(client: Client): Promise<Client> {
    return client.on('message', async msg => {
      if (msg.content.startsWith('.list') && !msg.author.bot) {
        const user = await this.clientRepo.getClientByDiscordId({
          discordId: msg.author.id,
        });
        if (user) {
          const services = await this.servicesRepo.getByClientId(user.id);
          const eb = new MessageEmbed();
          eb.setTitle(`List - ${msg.author.username}`);
          eb.setColor(0x00ff00);
          eb.addField('Number of services: ', services.length, false);
          services.map(async s => {
            eb.addField('Guild:', s.guild.name, true);
          });
          msg.author.send(eb);
        } else {
          const eb = new MessageEmbed();
          eb.setTitle('List');
          eb.setColor(0xff0000);
          eb.addField(
            'Error:',
            "Sorry, but it looks like you don't have any records yet. Visit the channel instructions to learn how to register :)",
            false,
          );
          msg.author.send(eb);
        }
      }
    });
  }
}
