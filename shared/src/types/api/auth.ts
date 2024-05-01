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

export const Config = z.object({
  defaultPaginationLimit: z.coerce.number(),
  paginationLimitOptions: z.preprocess((v) => {
    if (Array.isArray(v)) return v;
    try {
      const wrapped = String(v).replaceAll(/(\w+)/g, '"$1"');
      return JSON.parse(wrapped);
    } catch {}

    return v;
  }, z.array(z.coerce.number().int().min(1))),
});

export type Config = z.infer<typeof Config>;

export const Session = z.object({
  user: FrontendUser.nullable(),
  config: Config,
});

export type Session = z.infer<typeof Session>;


export const GetSession = z.object({
  data: Session,
});

export type GetSession = z.infer<typeof GetSession>;

export const GetConfig = z.object({
  data: Config,
});

export type GetConfig = z.infer<typeof GetConfig>;


export const PostConfigReqBody = Config;

export type PostConfigReqBody = z.infer<typeof PostConfigReqBody>;
