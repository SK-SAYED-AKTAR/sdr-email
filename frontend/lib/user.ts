import { apiFetch } from "@/lib/api";

export type CurrentUser = {
  id: string;
  email: string;
  smtp_verified: boolean;
  created_at: string;
};

export function fetchCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/api/me");
}
