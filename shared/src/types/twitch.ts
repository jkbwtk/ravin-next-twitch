export interface RefreshAccessToken {
  access_token: string,
  refresh_token: string,
  expires_in: number,
  scope: string,
  token_type: string,
}

export interface GetAllStreamTagsOptions {
  after?: string,
  first?: string,
  tag_id?: string | string[],
}

export interface GetGamesOptions {
  id: string | string[],
  name: string | string[],
}

export interface GetStreamsOptions {
  after?: string,
  before?: string,
  first?: number,
  game_id?: string | string[],
  language?: string | string[],
  user_id?: string | string[],
  user_login?: string | string[],
}

export interface GetStreamsOptions {
  after?: string,
  before?: string,
  first?: number,
  game_id?: string | string[],
  language?: string | string[],
  user_id?: string | string[],
  user_login?: string | string[],
}

export interface GetTeamsOptions {
  name: string,
  id: string,
}

export interface GetTopGamesOptions {
  after?: string,
  before?: string,
  first?: string,
}

export interface GetUsersFollowsOptions {
  after?: string,
  first?: number,
  from_id: string,
  to_id: string,
}

export interface GetUsersOptions {
  id: string | string[],
  login: string | string[],
}

export interface GuardianSettings {
  timeoutRetries: number,
  notFoundRetries: number,
  backoff: number,
}

export interface TwitchChannel {
  broadcaster_id: string,
  broadcaster_login: string,
  broadcaster_name: string,
  game_name: string,
  game_id: string,
  broadcaster_language: string,
  title: string,
  delay: number
}

export interface TwitchChannelEmote {
  id: string,
  name: string,
  images: {
    url_1x: string,
    url_2x: string,
    url_4x: string,
  },
  tier: string,
  emote_type: 'bitstier' | 'follower' | 'subscriptions',
  emote_set_id: string,
  format: ('animated' | 'static')[],
  scale: ('1.0' | '2.0' | '3.0')[],
  theme_mode: ('dark' | 'light')[],
}

export interface TwitchChatSettings {
  broadcaster_id: string,
  emote_mode: boolean,
  follower_mode: boolean,
  follower_mode_duration: number,
  slow_mode: boolean,
  slow_mode_wait_time: number,
  subscriber_mode: boolean,
  unique_chat_mode: boolean
}

export interface TwitchCheermote {
  prefix: string,
  tiers: {
    min_bits: number,
    id: string,
    color: string,
    images: {
      dark: {
        animated: {
          '1': string,
          '2': string,
          '3': string,
          '4': string,
          '1.5': string,
        },
        static: {
          '1': string,
          '2': string,
          '3': string,
          '4': string,
          '1.5': string,
        }
      },
      light: {
        animated: {
          '1': string,
          '2': string,
          '3': string,
          '4': string,
          '1.5': string,
        },
        static: {
          '1': string,
          '2': string,
          '3': string,
          '4': string,
          '1.5': string,
        }
      }
    },
    can_cheer: boolean,
    show_in_bits_card: boolean,
  }[],
  type: 'global_first_party' | 'global_third_party' | 'channel_custom' | 'display_only' | 'sponsored',
  order: number,
  last_updated: string,
  is_charitable: boolean,
}

export interface TwitchFollow {
  from_id: string,
  from_login: string,
  from_name: string,
  to_id: string,
  to_login: string,
  to_name: string,
  followed_at: string,
}

export interface TwitchGame {
  box_art_url: string,
  id: string,
  name: string,
}

export interface TwitchGlobalEmote {
  id: string,
  name: string,
  images: {
    url_1x: string,
    url_2x: string,
    url_4x: string,
  },
  emote_type: 'bitstier' | 'follower' | 'subscriptions',
  emote_set_id: string,
  format: ('animated' | 'static')[],
  scale: ('1.0' | '2.0' | '3.0')[],
  theme_mode: ('dark' | 'light')[],
}

export interface TwitchStream {
  id: string,
  user_id: string,
  user_login: string,
  user_name: string,
  game_id: string,
  game_name: string,
  type: 'live' | '',
  title: string,
  viewer_count: number,
  started_at: string,
  language: string,
  thumbnail_url: string,
  tag_ids: string[],
  is_mature: boolean,
}

export interface TwitchStreamTag {
  tag_id: string,
  is_auto: boolean,
  localization_names: {
    [key: string]: string,
  },
  localization_descriptions: {
    [key: string]: string,
  },
}

export interface TwitchTeam {
  users: TwitchBriefUser[],
  background_image_url: string,
  banner: string,
  created_at: string,
  updated_at: string,
  info: string,
  thumbnail_url: string,
  team_name: string,
  team_display_name: string,
  id: string,
}

export type GetChannelInformationReturn<T extends string | string[]> = T extends string ? TwitchChannel: TwitchChannel[];

interface GetVideosOptionsBase {
  after?: string,
  before?: string,
  first?: number,
  language?: string,
  period?: 'all' | 'day' | 'week' | 'month',
  sort?: 'time' | 'trending' | 'views',
  type?: 'all' | 'upload' | 'archive' | 'highlight',
}

export type GetVideosOptions = ({
  id: string | string[],
  user_id?: never,
  game_id?: never,
}) | ({
  id?: never,
  user_id: string,
  game_id?: never,
} & GetVideosOptionsBase) | ({
  id?: never,
  user_id?: never,
  game_id: string,
} & GetVideosOptionsBase);

interface TwitchVideoBase {
  id: string,
  user_id: string,
  user_login: string,
  user_name: string,
  title: string,
  description: string,
  created_at: string,
  published_at: string,
  url: string,
  thumbnail_url: string,
  viewable: 'public' | 'private',
  view_count: number,
  language: string,
  duration: string,
  muted_segments: {
    duration: number,
    offset: number,
  }[],
  pagination: {
    cursor?: string
  }
}

export type TwitchVideo = TwitchVideoBase & ({
  stream_id: string,
  type: 'archive',
} | {
  stream_id: null,
  type: 'upload' | 'highlight',
});

export type TwitchChannelTeam = Omit<TwitchTeam, 'users'> & {
  broadcaster_id: string,
  broadcaster_name: string,
  broadcaster_login: string,
};

export interface Tokens {
  client_id: string;
  refresh_token: string;
  client_secret: string;
  access_token: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email: string;
  type: 'staff' | 'admin' | 'global_mod' | '';
  broadcaster_type: 'partner' | 'affiliate' | '';
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  // view_count: number; // https://discuss.dev.twitch.tv/t/get-users-api-endpoint-view-count-deprecation/37777
  created_at: string;
}

export interface TwitchBriefUser {
  user_id: string;
  user_login: string;
  user_name: string;
}

export interface GetTwitchModerators {
  data: TwitchBriefUser[];
}

export interface GetTwitchUsers {
  cursor: string;
  total: number;
  data: TwitchUser[];
}

export interface GetChatters {
  data: TwitchBriefUser[];
  pagination: {
    cursor: string;
  };
  total: number;
}
