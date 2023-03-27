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

export type Action = {
  date: number,
  issuerDisplayName: string;
  targetDisplayName: string;
} & ({
  type: 'ban',
  reason: string;
} | {
  type: 'timeout',
  duration: number;
} | {
  type: 'delete',
  message: string;
});

export interface GetRecentActionsResponse {
  data: Action[];
}

export interface ChatStats {
  dateStart: number;
  dateEnd: number;

  messagesTotal: number;
  timeoutsTotal: number;
  bansTotal: number;
  deletedTotal: number;
  commandsTotal: number;

  messages: [number, number, number][]; // [timestamp, sampling duration, count]
}

export interface GetChatStatsResponse {
  data: ChatStats;
}
