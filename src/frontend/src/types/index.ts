export type {
  UserPublic,
  Role,
  LoginResult,
  CreateUserResult,
  NotificationPublic,
} from "@/backend";
export { Role as RoleEnum } from "@/backend";

export interface AuthState {
  user: import("@/backend").UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  lastActivity: number;
}
