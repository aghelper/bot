import { Injectable } from '@nestjs/common';
import { Client } from 'discord.js';
import { LogService } from '@agh/shared/log/log.service';

@Injectable()
export class JoinedService {
  constructor(private readonly logService: LogService) {}

  async addJoinedListener(client: Client): Promise<Client> {
    return client.on('guildMemberAdd', async event => {
      try {
        const aggredRole = await event.guild.roles.fetch('682508878285635594');
        const memberId = event.id;
        const member = await event.guild.members.fetch(memberId);
        await member.roles.add(aggredRole);
      } catch (err) {
        console.log('ERROR: give role to new member');
        this.logService.createErrorLog(err);
      }
    });
  }
}
