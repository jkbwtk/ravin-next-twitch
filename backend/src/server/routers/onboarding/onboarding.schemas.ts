import { OnboardingForm } from '#shared/types/api/onboarding';
import { z } from 'zod';


export type GetOnboardingViewRequest = {
  query: {
    key: string;
  }
};

export const GetOnboardingSchema = z.object({
  query: z.object({
    key: z.string().min(1).max(64),
  }),
}) satisfies z.Schema<GetOnboardingViewRequest>;

export type PostSubmitOnboardingRequest = {
  body: OnboardingForm
};

export const PostSubmitOnboardingSchema = z.object({
  body: z.object({
    key: z.string().min(1).max(64),
    adminUsername: z.string().min(1).max(64),
    botLogin: z.string().min(1).max(64),
    botToken: z.string().min(1).max(64),
    twitchClientId: z.string().min(1).max(64),
    twitchClientSecret: z.string().min(1).max(64),
  }),
}) satisfies z.Schema<PostSubmitOnboardingRequest>;
