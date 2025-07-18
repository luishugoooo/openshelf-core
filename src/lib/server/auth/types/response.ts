import type { SelectUser } from "./user";

export interface AuthResponse {
  access_token: string;
  refresh_token: string | null;
}
