import { Injectable } from '@nestjs/common';
import { ClientRepository } from '@agh/orm/repository/client.repository';
import { Client, MessageEmbed, WebhookClient, Message } from 'discord.js';
import {
  GuildRepository,
  ServiceRepository,
  GuildMemberRepository,
  MemberHistoryRepository,
} from '@agh/orm/repository';
import axios from 'axios';
import { LogService } from '@agh/shared/log/log.service';
import {
  GuildEntity,
  GuildMemberEntity,
  MemberHistoryEntity,
  ClientEntity,
} from '@agh/orm/entity';
import {
  CreateClientDTO,
  CreateGuildDTO,
  CreateMemberHistoryDTO,
  CreateGuildMemberDTO,
  CreateServiceDTO,
} from '@agh/orm/dto';
import { AlbionMember, AlbionGuild } from '@agh/shared/types';
import * as CryptoJS from 'crypto-js';
@Injectable()
export class RegisterCmdService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly guildRepo: GuildRepository,
    private readonly serviceRepo: ServiceRepository,
    private readonly guildMemberRepo: GuildMemberRepository,
    private readonly memberHistoryRepo: MemberHistoryRepository,
    private readonly logService: LogService,
  ) {}
  async addRegister(client: Client): Promise<Client> {
    return client.on('message', async msg => {
      if (msg.content.startsWith('.register') && !msg.author.bot) {
        const ebFristMsg = new MessageEmbed();
        ebFristMsg.setTitle('Welcome :)');
        ebFristMsg.setColor(0xffff00);
        ebFristMsg.addField('Hi ', msg.author.username, true);
        ebFristMsg.addField(
          'Status: ',
          'We are currently working on your request, this may take a while as we depend on the Albion Online website, you will recieve a new msg as soon as we are done :)',
          false,
        );
        msg.author.send(ebFristMsg);

        const msgArr = msg.content.replace(/(\r\n|\n|\r)/gm, ' ').split(' ');
        if (msgArr.length == 1) {
          const eb = new MessageEmbed();
          eb.setTitle('Welcome :)');
          eb.setColor(0xffff00);
          eb.addField('Hi ', msg.author.username, true);
          eb.addField(
            'Warning',
            'You just typed .register, to register a guild we need more information, ' +
              'please take a look in our **#instructions** channel, if you still need help, please send a msg to ' +
              'TehHutt, he is my creator, he probably know how to help you :), see you soon!',
            false,
          );
          msg.author.send(eb);
          return;
        }

        const link = msgArr[msgArr.length - 1];
        const linkArr = link.split('/');

        if (linkArr.length != 7) {
          const eb = new MessageEmbed();
          eb.setTitle('ERROR:');
          eb.setColor(0xff0000);
          eb.addField('Name', msg.author.username, true);
          eb.addField(
            'ERROR: ',
            'Your webhook link seems to be wrong, please verify it :)',
            false,
          );
          msg.author.send(eb);
          return;
        }

        let webGuildName = '';
        let rawGuildName = '';
        for (
          let i = msgArr.indexOf('Guild:') + 1;
          i < msgArr.indexOf('WebHook:');
          i++
        ) {
          rawGuildName += msgArr[i] + ' ';
          webGuildName += msgArr[i] + '%20';
        }
        rawGuildName = rawGuildName.trimLeft();
        rawGuildName = rawGuildName.trimRight();
        webGuildName = webGuildName.substring(0, webGuildName.length - 3);

        const guild = await this.guildRepo.getByGuildName(rawGuildName);
        let dbGuild, dbClient;
        if (guild && guild.client.discord_id != msg.author.id) {
          //Guild Exist and it belong to someone else :)
          const eb = new MessageEmbed();
          eb.setTitle('ERROR:');
          eb.setColor(0xff0000);
          eb.addField('Name', msg.author.username, true);
          eb.addField('Error: ', 'This guild is already registred :)', false);
          eb.addField(
            'Attention',
            `If **${rawGuildName}** is your guild, please send a msg to TehHutt`,
            false,
          );
          msg.author.send(eb);
          return;
        }
        if (guild && guild.client.discord_id == msg.author.id) {
          //Guild exist and the owner is the same person who sent the request again.
          const eb = new MessageEmbed();
          eb.setColor(0x00ff00);
          eb.setTitle('Everything is done :)');
          eb.addField(
            'Reason:',
            'Your guild has been already registred by you, and is working fine :)',
            false,
          );
          eb.addField(
            'Attention',
            'If you are having some trouble with our service, please check our status by typing: **.status** if is something else, please send a msg to my creator TehHutt :)',
            false,
          );
          msg.author.send(eb);
          return;
        } else {
          let webGuild = await this.getGuild(webGuildName, msg, rawGuildName);
          dbClient = await this.clientRepo.getClientByDiscordId({
            discordId: msg.author.id,
          });
          if (dbClient) {
            //Client already exists
            dbGuild = await this.guildRepo.createGuild({
              client: dbClient,
              services: [],
              guildMember: [],
              inGameId: webGuild.Id,
              name: webGuild.Name,
              inGameAllyId: webGuild.AllianceId,
              deathFame: webGuild.DeathFame,
            });
          } else {
            //create new client and new guild
            const clientToCreate = new CreateClientDTO();
            clientToCreate.discordId = msg.author.id;
            clientToCreate.discordName = msg.author.username;
            clientToCreate.guild = [];
            clientToCreate.guild.push();
            clientToCreate.isActive = true;

            dbClient = await this.clientRepo.createClient(clientToCreate);

            dbGuild = await this.guildRepo.createGuild({
              client: dbClient,
              services: [],
              guildMember: [],
              inGameId: webGuild.Id,
              name: webGuild.Name,
              inGameAllyId: webGuild.AllianceId,
              deathFame: webGuild.DeathFame,
            });
          }
        }

        if (!(await this.updateCurrentMembers(dbGuild, msg))) {
          const eb = new MessageEmbed();
          eb.setColor(0xff0000);
          eb.addField(
            'Reason:',
            "We could't get the information we needed from the albion web site, could you please try again in a few minutes ? Or if you want to test if it's possible now just type **.status** it will check for you :)",
            false,
          );
          msg.author.send(eb);
          return;
        }

        const encryptId = (await this.encrypt(linkArr[5])).toString();
        const encryptToken = (await this.encrypt(linkArr[6])).toString();
        await this.addService(dbGuild, dbClient, encryptId, encryptToken);

        const decryptedId = await this.decrypt(encryptId);
        const decryptedToken = await this.decrypt(encryptToken);
        const webHookClient = new WebhookClient(decryptedId, decryptedToken);
        const welcomeChannelMsg = new MessageEmbed();
        welcomeChannelMsg.setTitle('Success:');
        welcomeChannelMsg.setColor(0x00ff00);
        welcomeChannelMsg.addField('Welcome :)', rawGuildName, true);
        welcomeChannelMsg.addField(
          msg.author.username,
          'Welcome to agh, in this channel we will start posting who left and joined your guild :)',
          false,
        );
        try {
          webHookClient.send(welcomeChannelMsg);
        } catch (err) {
          console.error('ERROR: trying to send welcome msg: ', err);
          this.logService.createErrorLog(err);
        }

        const eb = new MessageEmbed();
        eb.setTitle('Success:');
        eb.setColor(0x00ff00);
        eb.addField('Name', msg.author.username, true);
        eb.addField(
          'Status: ',
          "It's done! You have been added to our service, you will recieve a msg in your channel in a few seconds.",
          false,
        );
        msg.author.send(eb);
        return client;
      }
    });
  }
  async getGuild(
    guildName: string,
    msg: Message,
    rawGuildName: string,
  ): Promise<AlbionGuild> | undefined {
    const baseUrl = 'https://gameinfo.albiononline.com/api/gameinfo/';
    let instance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    try {
      const res = await instance.get(`search?q=${guildName}`);
      if (res.data.guilds.length == 0) {
        const eb = new MessageEmbed();
        eb.setTitle('ERROR:');
        eb.setColor(0xff0000);
        eb.addField('Name', msg.author.username, true);
        eb.addField(
          'Error: ',
          "Sorry, we couldn't find any guild with that name. Please remember that this is case sensitive if you need help, please contact TehHutt :)",
          false,
        );
        msg.author.send(eb);
        return;
      }

      const selectedGuild = res.data.guilds.filter((e: { Name: string }) => {
        return e.Name == rawGuildName;
      })[0] as AlbionGuild;

      return selectedGuild;
    } catch (err) {
      const eb = new MessageEmbed();
      eb.setTitle('Sorry we could not complete your request :(');
      eb.setColor(0xff0000);
      eb.addField(
        'Reason:',
        "We could't get the information we needed from the albion web site, could you please try again in a few minutes ? Or if you want to test if it's possible now just type **.status** it will check for you :)",
        false,
      );
      msg.author.send(eb);
      await this.logService.createErrorLog(err);
    }
  }

  async updateCurrentMembers(
    guild: GuildEntity,
    msg: Message,
  ): Promise<boolean> {
    const baseUrl = 'https://gameinfo.albiononline.com/api/gameinfo/';
    let instance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    try {
      const res = await instance.get(`/guilds/${guild.in_game_id}/members`);
      res.data.forEach(async (member: AlbionMember) => {
        await this.addMemberToGuild(member, guild);
        await this.addMemberToHistory(member, guild);
      });
      return true;
    } catch (err) {
      await this.logService.createErrorLog(err);
      return false;
    }
  }

  async addMemberToHistory(
    data: AlbionMember,
    guild: GuildEntity,
  ): Promise<MemberHistoryEntity> {
    const mh = new CreateMemberHistoryDTO();
    mh.name = data.Name;
    mh.pve_hellgate = data.LifetimeStatistics.PvE.Hellgate;
    mh.pve_mobs =
      data.LifetimeStatistics.PvE.Outlands + data.LifetimeStatistics.PvE.Royal;
    mh.pve_total = data.LifetimeStatistics.PvE.Total;
    mh.killFame = data.KillFame;
    mh.inGameId = data.Id;
    mh.guildName = guild.name;
    mh.gatheringWood = data.LifetimeStatistics.Gathering.Wood.Total;
    mh.gatheringFiber = data.LifetimeStatistics.Gathering.Fiber.Total;
    mh.gatheringRock = data.LifetimeStatistics.Gathering.Rock.Total;
    mh.gatheringOre = data.LifetimeStatistics.Gathering.Ore.Total;
    mh.gatheringHide = data.LifetimeStatistics.Gathering.Hide.Total;
    mh.gatheringTotal = data.LifetimeStatistics.Gathering.All.Total;
    mh.fameRatio = data.FameRatio;
    mh.deathFame = data.DeathFame;
    mh.crystal_league = data.LifetimeStatistics.CrystalLeague;
    mh.craftingTotal = data.LifetimeStatistics.Crafting.Total;
    mh.avgIp = data.AvgIp;
    mh.avatarRing = data.AvatarRing;
    mh.avatar = data.Avatar;
    mh.allyTag = data.AllianceTag;
    mh.allyName = data.AllianceName;
    mh.allyId = data.AllianceId;
    mh.timeStemp = data.LifetimeStatistics.Timestamp;
    return this.memberHistoryRepo.createMemberHistory(mh);
  }

  async addMemberToGuild(
    data: AlbionMember,
    guild: GuildEntity,
  ): Promise<GuildMemberEntity> {
    const gm = new CreateGuildMemberDTO();
    gm.name = data.Name;
    gm.pve_hellgate = data.LifetimeStatistics.PvE.Hellgate;
    gm.pve_mobs =
      data.LifetimeStatistics.PvE.Outlands + data.LifetimeStatistics.PvE.Royal;
    gm.pve_total = data.LifetimeStatistics.PvE.Total;
    gm.killFame = data.KillFame;
    gm.inGameId = data.Id;
    gm.guild = guild;
    gm.gatheringWood = data.LifetimeStatistics.Gathering.Wood.Total;
    gm.gatheringFiber = data.LifetimeStatistics.Gathering.Fiber.Total;
    gm.gatheringRock = data.LifetimeStatistics.Gathering.Rock.Total;
    gm.gatheringOre = data.LifetimeStatistics.Gathering.Ore.Total;
    gm.gatheringHide = data.LifetimeStatistics.Gathering.Hide.Total;
    gm.gatheringTotal = data.LifetimeStatistics.Gathering.All.Total;
    gm.fameRatio = data.FameRatio;
    gm.deathFame = data.DeathFame;
    gm.crystal_league = data.LifetimeStatistics.CrystalLeague;
    gm.craftingTotal = data.LifetimeStatistics.Crafting.Total;
    gm.avgIp = data.AvgIp;
    gm.avatarRing = data.AvatarRing;
    gm.avatar = data.Avatar;
    gm.allyTag = data.AllianceTag;
    gm.allyName = data.AllianceName;
    gm.allyId = data.AllianceId;
    gm.timeStemp = data.LifetimeStatistics.Timestamp;
    return this.guildMemberRepo.createGuildMember(gm);
  }

  async addService(
    guild: GuildEntity,
    client: ClientEntity,
    id: string,
    token: string,
  ): Promise<void> {
    const serviceDTO = new CreateServiceDTO();
    serviceDTO.guild = guild;
    serviceDTO.client = client;
    serviceDTO.description = '';
    serviceDTO.isActive = true;
    serviceDTO.hookId = id;
    serviceDTO.hookToken = token;
    serviceDTO.ttl = await this.ttlDate();
    serviceDTO.name = 'Members  Logs';

    await this.serviceRepo.createService(serviceDTO);
  }

  async ttlDate(): Promise<Date> {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    return new Date(y + 1, m, d);
  }

  async encrypt(data: string): Promise<CryptoJS.WordArray> {
    const key = CryptoJS.enc.Utf8.parse(process.env.CRYPTO_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.CRYPTO_IV);
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted;
  }

  async decrypt(data: string): Promise<string> {
    const key = CryptoJS.enc.Utf8.parse(process.env.CRYPTO_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.CRYPTO_IV);
    const decrypted = CryptoJS.AES.decrypt(data, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
