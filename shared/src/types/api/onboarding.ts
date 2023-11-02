import { z } from 'zod';


export const OnboardingForm = z.object({
  key: z.string().min(1).max(64),
  adminUsername: z.string().min(1).max(64),
  botLogin: z.string().min(1).max(64),
  botToken: z.string().min(1).max(64),
  twitchClientId: z.string().min(1).max(64),
  twitchClientSecret: z.string().min(1).max(64),
});

export type OnboardingForm = z.infer<typeof OnboardingForm>;


export const PostOnboardingSchemaReqBody = OnboardingForm;

export type PostOnboardingSchemaReqBody = z.infer<typeof PostOnboardingSchemaReqBody>;
