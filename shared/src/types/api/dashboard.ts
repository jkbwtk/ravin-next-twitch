export interface Moderator {
  avatarUrl: string;
  displayName: string;
  status: boolean;
}

export interface GetModeratorsResponse {
  data: Moderator[];
}

export interface BotConnectionStatus {
  channel: string;
  joined: boolean;
  admin: boolean;
}

export interface GetBotConnectionStatusResponse {
  data: BotConnectionStatus;
}

export interface TopStats {
  chatter: {
    avatarUrl: string;
    displayName: string;
  },
  command: string;
  emote: {
    url: string;
    name: string;
  }
}

export interface GetTopStatsResponse {
  data: TopStats;
}
