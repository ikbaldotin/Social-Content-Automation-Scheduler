import api from "./axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}
export interface LoginInput {
  email: string;
  password: string;
}
export interface RegisterInput extends LoginInput {
  name: string;
}
export const registerUser = async (data: RegisterInput) => {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LoginInput) => {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get<{
    message: string;
    user: AuthUser | null;
    token: string;
  }>("/auth/me");
  return response.data.user;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};
