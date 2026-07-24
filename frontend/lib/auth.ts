export type Role = "admin" | "operator" | "viewer";

export interface UserState {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export function getStoredUser(): UserState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserState;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserState, token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}
