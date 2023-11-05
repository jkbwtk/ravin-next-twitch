import { z } from 'zod';


export interface GetMockApp {
  cursor: string;
  total: number;
  data: MockApp[];
}

export interface MockApp {
  ID: string;
  Secret: string;
  Name: string;
  IsExtension: boolean;
}

export interface AccessToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

export const FrontendUser = z.object({
  id: z.string().min(1),
  login: z.string().min(1),
  displayName: z.string().min(1),
  profileImageUrl: z.string().url(),
  admin: z.boolean(),
});

export type FrontendUser = z.infer<typeof FrontendUser>;


export const GetFrontendUser = z.object({
  data: FrontendUser,
});

export type GetFrontendUser = z.infer<typeof GetFrontendUser>;
