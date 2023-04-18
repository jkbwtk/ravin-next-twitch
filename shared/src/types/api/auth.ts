export interface GetTwitchUsers {
  cursor: string;
  total: number;
  data: TwitchUser[];
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email: string;
  type: string;
  broadcaster_type: TwitchBroadcasterType;
  description: string;
  created_at: Date;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  game_id: TwitchGame;
  game_name: TwitchGame;
  title: string;
  stream_language: string;
  delay: number;
}

export enum TwitchBroadcasterType {
  Affiliate = 'affiliate',
  Empty = '',
  Partner = 'partner',
}

export interface TwitchGame {
  String: string;
  Valid: boolean;
}

export interface GetMockApp {
  cursor: string;
  total: number;
  data: MockApp[];
}

export interface MockApp {
  ID: string;
  Secret: string;
  Name: string;
  IsExtension: boolean;
}

export interface AccessToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

export interface FrontendUser {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
}

export interface GetFrontendUser {
  data: FrontendUser;
}
