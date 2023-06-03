export type Emote = {
  name: string;
  count: number;
  positions: string[];
};

export type EmotesUsed = {
  [id: string]: Emote;
};

export type Message = {
  id: string;
  channelId: string;
  channelName: string;
  color: string | null;
  userId: string;
  displayName: string;
  emotes: EmotesUsed | null,
  content: string;
  timestamp: number;
};

export type GetMessagesResponse = {
  data: Message[];
};
