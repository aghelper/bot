import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'discord.js';
import { RegisterCmdService } from './commands/register/register.service';
import { StatusCmdService } from './commands/status/status.service';
import { ListCmdService } from './commands/list/list.service';
import { JoinedService } from './event/joined/joined.service';
import { HelpCmdService } from './commands/help/help.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly registerCmd: RegisterCmdService,
    private readonly statusCmd: StatusCmdService,
    private readonly listCmd: ListCmdService,
    private readonly joinedService: JoinedService,
    private readonly helpCmd: HelpCmdService,
  ) {}
  onModuleInit() {
    this.start();
  }
  async start() {
    let client = new Client();

    client = await this.registerCmd.addRegister(client);
    client = await this.statusCmd.addStatus(client);
    client = await this.listCmd.addList(client);
    client = await this.joinedService.addJoinedListener(client);
    client = await this.helpCmd.addHelp(client);

    client.on('ready', () => {
      console.log('Agh bot is online! 🚀');
    });

    try {
      await client.login(process.env.TOKEN);
      // await client.login(process.env.STG_TOKEN);
    } catch (err) {
      console.log(err);
    }
  }
}
