
export interface SyncData {
  id: number;
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  nickname: string;
  email: string;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}