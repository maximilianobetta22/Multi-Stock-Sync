export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
