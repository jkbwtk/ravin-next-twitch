import { PostOnboardingSchemaReqBody } from '#shared/types/api/onboarding';
import { z } from 'zod';


export const GetOnboardingSchema = z.object({
  query: z.object({
    key: z.string().min(1).max(64),
  }),
});

export type GetOnboardingSchema = z.infer<typeof GetOnboardingSchema>;


export const PostOnboardingSchema = z.object({
  body: PostOnboardingSchemaReqBody,
});

export type PostSubmitOnboardingSchema = z.infer<typeof PostOnboardingSchema>;
