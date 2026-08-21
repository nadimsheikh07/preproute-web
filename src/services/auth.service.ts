import api from "@/lib/axios";
import { LoginRequest, LoginResponse, User } from "@/types/auth";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", payload);

    const result = response.data;

    if (result.status !== "success" || !result.data?.token) {
      throw new Error(result.message || "Login failed");
    }

    localStorage.setItem(AUTH_TOKEN_KEY, result.data.token);

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data.user));

    return result;
  },

  logout() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") {
      return null;
    }

    const user = localStorage.getItem(AUTH_USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
