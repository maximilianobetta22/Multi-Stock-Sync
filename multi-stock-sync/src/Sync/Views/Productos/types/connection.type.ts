export interface Connection {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  nickname: string;
  email: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionDropdownProps {
  connections?: Connection[]; // Make connections optional
  selectedConnection?: string;
  onChange: (clientId: string) => void;
}
