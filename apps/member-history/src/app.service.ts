import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DecryptedMessage, enc, AES, mode, pad } from 'crypto-js';
import { AlbionMember } from '@agh/shared/types';
import { LogService } from '@agh/shared/log/log.service';
import axios from 'axios';
import {
  GuildEntity,
  GuildMemberEntity,
  MemberHistoryEntity,
  ServiceEntity,
} from '@agh/orm/entity';
import {
  ServiceRepository,
  GuildMemberRepository,
  MemberHistoryRepository,
} from '@agh/orm/repository';
import { CreateGuildMemberDTO, CreateMemberHistoryDTO } from '@agh/orm/dto';
import { WebhookClient, MessageEmbed } from 'discord.js';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly logService: LogService,
    private readonly serviceRepo: ServiceRepository,
    private readonly guildMemberRepo: GuildMemberRepository,
    private readonly memberHistoryRepo: MemberHistoryRepository,
  ) {}
  onModuleInit() {
    this.start();
  }
  async getHello(): Promise<string> {
    return 'hello';
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async start(): Promise<void> {
    const lstOfServices = await this.serviceRepo.getAllActive();
    Promise.all(lstOfServices.map(async service => {
      console.log('Verifying guild: ', service.guild.name);
      try {
        let lstOfCurrentMembers = await this.getCurrentMembers(service.guild);
        if (lstOfCurrentMembers.length == 0) {
          this.logService.createInfoLog(
            `List of members for ${service.guild.name} was empty`,
          );
          return;
        }

        const lstOfDbMembers = await this.guildMemberRepo.getAllByGuild(
          service.guild,
        );

        Promise.all(lstOfCurrentMembers.map(async m => {
          const found = lstOfDbMembers.find(db => db.in_game_id == m.Id);
          if (!found) {
            await this.addMemberToDb(m, service.guild);
            await this.addMemberToHistory(m, service.guild);
            await this.sendJoinMsgToWebHook(m, service);
            console.log(`${new Date().toString()} Member: ${m.Name} \t Joined: ${service.guild.name}`)
          }
        })).then(() => {
          Promise.resolve();
        }).catch(() => {
          Promise.reject();
        });

        Promise.all(lstOfDbMembers.map(async db => {
          const found = lstOfCurrentMembers.find(m => m.Id == db.in_game_id);
          if (!found) {
            await this.sendLeftMsgToWebHook(db, service);
            await this.guildMemberRepo.deleteMember(db);
            console.log(`${new Date().toString()} Member: ${db.name} \t Joined: ${service.guild.name}`)
          }
        })).then(() => {
          Promise.resolve();
        }).catch(()=> {
          Promise.reject();
        });

      } catch (err) {
        console.error('ERROR: inside forEach services: ', err);
      }
    })).then(()=>{
      Promise.resolve();
    }).catch(()=>{
      Promise.reject();
    });
  }
  async sendJoinMsgToWebHook(
    member: AlbionMember,
    service: ServiceEntity,
  ): Promise<void> {
    try {
      const id = await this.decrypt(service.hook_id);
      const token = await this.decrypt(service.hook_token);

      const webHookClient = new WebhookClient(id, token);
      const msg = new MessageEmbed();
      msg.setTitle(`Joined ${service.guild.name}`);
      msg.setColor(0x00ff00);
      msg.addField('Name', member.Name, true);
      msg.addField('Fame Ratio: ', member.FameRatio, true);
      msg.addField(
        'PvE Fame: ',
        await this.formatNumber(member.LifetimeStatistics.PvE.Total),
        true,
      );
      msg.addField(
        'PvP KillFame:',
        await this.formatNumber(member.KillFame),
        true,
      );
      msg.addField(
        'Gathering Total:',
        await this.formatNumber(member.LifetimeStatistics.Gathering.All.Total),
        true,
      );
      msg.addField(
        'Crafting Total: ',
        await this.formatNumber(member.LifetimeStatistics.Crafting.Total),
        true,
      );
      webHookClient.send(msg);
    } catch (err) {
      console.error('ERROR: Inside JoinMsg', err);
    }
  }
  async sendLeftMsgToWebHook(
    member: GuildMemberEntity,
    service: ServiceEntity,
  ) {
    try {
      const id = await this.decrypt(service.hook_id);
      const token = await this.decrypt(service.hook_token);

      const webHookClient = new WebhookClient(id, token);
      const msg = new MessageEmbed();
      msg.setTitle(`Left ${service.guild.name}`);
      msg.setColor(0xff0000);
      msg.addField('Name', member.name, true);
      msg.addField('Fame Ratio: ', member.fame_ratio, true);
      msg.addField(
        'PvE Fame: ',
        await this.formatNumber(member.pve_total),
        true,
      );
      msg.addField(
        'PvP KillFame:',
        await this.formatNumber(member.kill_fame),
        true,
      );

      msg.addField(
        'Gathering Total:',
        await this.formatNumber(member.gathering_total),
        true,
      );
      msg.addField(
        'Crafting Total: ',
        await this.formatNumber(member.crafting_total),
        true,
      );

      webHookClient.send(msg);
    } catch (err) {
      console.error('ERROR: inside LeftMsg: ', err);
    }
  }
  async formatNumber(n: number): Promise<string> {
    return new Intl.NumberFormat().format(n);
  }
  async getCurrentMembers(guild: GuildEntity): Promise<AlbionMember[]> {
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
      return res.data;
    } catch (err) {
      this.logService.createErrorLog(err);
      return [];
    }
  }

  async decrypt(data: string): Promise<string> {
    const key = enc.Utf8.parse(process.env.CRYPTO_KEY);
    const iv = enc.Utf8.parse(process.env.CRYPTO_IV);
    const decrypted = AES.decrypt(data, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });
    return decrypted.toString(enc.Utf8);
  }

  async addMemberToDb(
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
    gm.gatheringTotal;
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
}
