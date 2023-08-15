import { z } from 'zod';
import { PatchConfigRequest } from '#types/api/admin';


export type PatchConfigRequestSchema = {
  body: PatchConfigRequest;
};

export const PatchConfigSchema = z.object({
  body: z.object({
    adminUsername: z.string().min(1).max(64).optional(),
    botLogin: z.string().min(1).max(64).optional(),
    botToken: z.string().min(1).max(64).optional(),
    twitchClientId: z.string().min(1).max(64).optional(),
    twitchClientSecret: z.string().min(1).max(64).optional(),
  }),
}) satisfies z.Schema<PatchConfigRequestSchema>;
