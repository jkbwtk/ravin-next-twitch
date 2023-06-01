export enum UserLevel {
  Everyone = 0,
  Subscriber = 1,
  VIP = 2,
  Moderator = 3,
  Owner = 4,
}

export type CustomCommand = {
  id: number;
  channelId: string;
  command: string;
  response: string;
  userLevel: UserLevel;
  cooldown: number;
  enabled: boolean;
};

export type GetCustomCommandsResponse = {
  data: CustomCommand[];
};

export type PostCustomCommandRequest = Omit<CustomCommand, 'id' | 'channelId'>;

export type PatchCustomCommandRequest = Partial<PostCustomCommandRequest> & Pick<CustomCommand, 'id'>;

export type DeleteCustomCommandRequest = {
  id: CustomCommand['id'];
};
