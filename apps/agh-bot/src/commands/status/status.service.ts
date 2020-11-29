import { Injectable } from '@nestjs/common';
import { Client, MessageEmbed, WebhookClient } from 'discord.js';
import axios from 'axios';
import { ClientRepository } from '@agh/orm/repository';
import { LogService } from '@agh/shared/log/log.service';

@Injectable()
export class StatusCmdService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly logService: LogService,
  ) {}
  async addStatus(client: Client): Promise<Client> {
    return client.on('message', async msg => {
      if (!msg.author.bot && msg.content.startsWith('.status')) {
        const ebFristMsg = new MessageEmbed();
        ebFristMsg.setTitle('Status');
        ebFristMsg.setColor(0xffff00);
        ebFristMsg.addField('Hi ', msg.author.username, true);
        ebFristMsg.addField(
          'Testing: ',
          'We will start doing some tests to check all services, you will receive a response as soon as possible :)',
          false,
        );
        await msg.author.send(ebFristMsg);

        let eb = new MessageEmbed();
        eb.setTitle('Status');
        let ebError = new MessageEmbed();

        let albionApiOk = false,
          dbConnOk = false,
          memberHistoryOk = false;

        try {
          await axios.get(
            'https://gameinfo.albiononline.com/api/gameinfo/search?q=TehHutt',
          );
          albionApiOk = true;
        } catch (err) {
          albionApiOk = false;
        }

        try {
          await this.clientRepo.getAllActive();
          dbConnOk = true;
        } catch (err) {
          dbConnOk = false;
        }

        try {
          const res = await axios.get('http://agh-member-history:3000/health');
          if (res.data.status == 'ok') {
            memberHistoryOk = true;
          } else {
            memberHistoryOk = false;
          }
        } catch (err) {
          memberHistoryOk = false;
        }

        if (albionApiOk) {
          eb.setColor(0x00ff00);
          eb.addField('Communication with Albion Web Site: ', '✅', false);
        } else {
          eb.setColor(0xff0000);
          eb.addField('Communication with Albion Web Site: ', '❌', false);
          ebError.addField('Communication with Albion Web Site: ', '❌', false);
        }

        if (dbConnOk) {
          eb.setColor(0x00ff00);
          eb.addField('DB Connection: ', '✅', false);
        } else {
          eb.setColor(0xff0000);
          eb.addField('DB Connection: ', '❌', false);
          ebError.addField('DB Connection: ', '❌', false);
        }

        if (memberHistoryOk) {
          eb.setColor(0x00ff00);
          eb.addField('Members History Service: ', '✅', false);
        } else {
          eb.setColor(0xff0000);
          eb.addField('Members History Service: ', '❌', false);
          ebError.addField('Members History Service: ', '❌', false);
        }

        if (!albionApiOk || !dbConnOk || !memberHistoryOk) {
          eb.addField(
            "It's seems that we have a problem, but",
            "Don't worry i will send a message to my creator, he will know what to do :)",
            false,
          );
          try {
            ebError.setTitle('Error in status');
            ebError.setColor(0xff0000);
            const me = await client.users.fetch('227840170626514944');
            await me.send(ebError);
          } catch (err) {
            this.logService.createErrorLog(
              'Could not open a private message with TehHutt on status error',
            );
            console.log(err);
          }
        }
        await msg.author.send(eb);
      }
    });
  }
}
