import { Injectable } from '@nestjs/common';
import { ClientRepository } from '@agh/orm/repository/client.repository';
import { Client, MessageEmbed, WebhookClient, Message } from 'discord.js';
import {
  GuildRepository,
  ServiceRepository,
  GuildMemberRepository,
  MemberHistoryRepository,
} from '@agh/orm/repository';
import { LogService } from '@agh/shared/log/log.service';

@Injectable()
export class ReportCmdService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly guildRepo: GuildRepository,
    private readonly serviceRepo: ServiceRepository,
    private readonly guildMemberRepo: GuildMemberRepository,
    private readonly memberHistoryRepo: MemberHistoryRepository,
    private readonly logService: LogService,
  ) {}
  async addRegister(client: Client): Promise<Client> {
    return client.on('message', async (msg) => {
      if (msg.content.startsWith('.report') && !msg.author.bot) {
      }
    });
  }
}
