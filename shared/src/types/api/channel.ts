export type ChantingSettings = {
  enabled: boolean;
  interval: number;
  length: number;
};

export type GetChantingSettingsResponse = {
  data: ChantingSettings;
};

export type PostChantingSettingsRequest = ChantingSettings;
