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

export interface FrontendUser {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  admin: boolean;
}

export interface GetFrontendUser {
  data: FrontendUser;
}
