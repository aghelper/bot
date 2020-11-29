export interface AlbionMember {
  AvgIp: number;
  Name: string;
  Id: string;
  GuildName: string;
  AllianceName: string;
  AllianceId: string;
  AllianceTag: string;
  Avatar: string;
  AvatarRing: string;
  DeathFame: number;
  KillFame: number;
  FameRatio: number;
  LifetimeStatistics: {
    PvE: {
      Total: number;
      Royal: number;
      Outlands: number;
      Hellgate: number;
    };
    Gathering: {
      Fiber: {
        Total: number;
        Royal: number;
        Outlands: number;
      };
      Hide: {
        Total: number;
        Royal: number;
        Outlands: number;
      };
      Ore: {
        Total: number;
        Royal: number;
        Outlands: number;
      };
      Rock: {
        Total: number;
        Royal: number;
        Outlands: number;
      };
      Wood: {
        Total: number;
        Royal: number;
        Outlands: number;
      };
      All: {
        Total: number;
        Royal: number;
        Outlands: number;
      };
    };
    Crafting: {
      Total: number;
      Royal: number;
      Outlands: number;
    };
    CrystalLeague: number;
    Timestamp: string;
  };
}
