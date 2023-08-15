export type ConfigRequest = {
  adminUsername: string;
  botLogin: string;
  botToken: string;
  twitchClientId: string;
  twitchClientSecret: string;
};

export type PatchConfigRequest = Partial<ConfigRequest>;
