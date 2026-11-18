import api from "../lib/axios";
import type { UsuarioLogin } from "../types/usuario";

export interface LoginResponse {
  access_token: string;
}

// Iniciar sesión (POST /auth/login)
export async function loginAuthService(
  datos: UsuarioLogin,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", datos);
  return data;
}
