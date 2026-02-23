import apiClient, { tokenStorage } from "@/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/types";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  user_id: number;
  email: string;
  name: string;
  role: "patient" | "doctor" | "admin";
  exp: number;
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register", data);
    const { tokens } = response.data;
    tokenStorage.setTokens(tokens.access, tokens.refresh);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    const { tokens } = response.data;
    tokenStorage.setTokens(tokens.access, tokens.refresh);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    tokenStorage.clearTokens();
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<string> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{ access: string }>("/auth/refresh", {
      refresh: refreshToken,
    });

    const { access } = response.data;
    tokenStorage.setTokens(access, refreshToken);
    return access;
  },

  /**
   * Get current user from token
   */
  getCurrentUser: (): User | null => {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        tokenStorage.clearTokens();
        return null;
      }

      return {
        id: decoded.user_id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };
    } catch {
      tokenStorage.clearTokens();
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const user = authService.getCurrentUser();
    return user !== null;
  },

  /**
   * Check if token is valid
   */
  isTokenValid: (): boolean => {
    const token = tokenStorage.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
