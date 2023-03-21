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
