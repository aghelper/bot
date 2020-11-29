export class CreateMemberHistoryDTO {
  guildName: string;
  avgIp: number;
  name: string;
  inGameId: string;
  allyName: string;
  allyId: string;
  allyTag: string;
  avatar: string;
  avatarRing: string;
  deathFame: number;
  killFame: number;
  fameRatio: number;
  pve_mobs: number;
  pve_hellgate: number;
  pve_total: number;
  gatheringFiber: number;
  gatheringHide: number;
  gatheringOre: number;
  gatheringRock: number;
  gatheringWood: number;
  gatheringTotal: number;
  craftingTotal: number;
  crystal_league: number;
  timeStemp: string;
}

export class MemberWhereNameOrIdDTO {
  name?: string;
  inGameId?: string;
}
