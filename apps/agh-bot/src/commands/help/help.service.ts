import { Inject, Injectable } from '@nestjs/common';
import { LogService } from '@agh/shared/log/log.service';
import { Client, MessageEmbed } from 'discord.js';

@Injectable()
export class HelpCmdService {
  constructor(private readonly logService: LogService) {}
  async addHelp(client: Client): Promise<Client> {
    return client.on('message', async (msg) => {
      if (msg.content.startsWith('.help') && !msg.author.bot) {
        const eb = new MessageEmbed();
        eb.setTitle('Help');
        eb.setColor(0xffff00);
        eb.addField(
          'Not implemented yet :(',
          'Sorry, we are working on a better way to help you, for now try to send a msg to TehHutt :)',
          false,
        );
        msg.author.send(eb);
      }
    });
  }
}
