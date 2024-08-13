import { z } from 'zod';


export const ChannelThreadInformation = z.object({
  title: z.string().min(1).max(255),
  gameName: z.string().min(1).max(255),
  gameId: z.string().min(1).max(255),
  delay: z.number().nonnegative(),
  tags: z.array(z.string().min(1).max(255)),
});

export type ChannelThreadInformation = z.infer<typeof ChannelThreadInformation>;

export const ChannelThreadStreamStatus = z.object({
  id: z.string().min(1).max(255),
  viewerCount: z.number().int().positive(),
  startedAt: z.coerce.date(),
  language: z.string().min(1).max(255),
  thumbnailUrl: z.string().min(1).max(255),
  isMature: z.boolean(),
});

export type ChannelThreadStreamStatus = z.infer<typeof ChannelThreadStreamStatus>;
