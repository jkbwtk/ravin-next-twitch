import { PatchConfigReqBody } from '#types/api/admin';
import { z } from 'zod';


export const PatchConfigSchema = z.object({
  body: PatchConfigReqBody,
});

export type PatchConfigSchema = z.infer<typeof PatchConfigSchema>;
