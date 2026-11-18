import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UsuarioAutenticado } from "../types/usuario";
import { obtenerUsuarioPorIdService } from "../services/usuarioService";

// Extrae solo el ID del payload del JWT usando JS nativo (cero librerías extra)
function extraerIdDelToken(token: string): number {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  const payload = JSON.parse(jsonPayload);
  return payload.id;
}

interface AuthState {
  token: string | null;
  usuario: UsuarioAutenticado | null;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<UsuarioAutenticado>;
  refrescarUsuario: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,

      login: async (accessToken) => {
        try {
          // 1. Guardamos el token primero para que el interceptor de Axios lo envíe en el header
          set({ token: accessToken });

          // 2. Decodificamos el ID del JWT y pedimos los datos reales a GET /usuario/:id
          const idUsuario = extraerIdDelToken(accessToken);
          const datosFrescos = await obtenerUsuarioPorIdService(idUsuario);

          // 3. Confirmamos la autenticación con el usuario completo
          set({
            usuario: datosFrescos,
            isAuthenticated: true,
          });

          return datosFrescos;
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      // Vuelve a consultar GET /usuario/:id para reflejar cambios hechos al usuario
      refrescarUsuario: async () => {
        const usuarioActual = get().usuario;
        if (!usuarioActual?.id) return;

        try {
          const datosActualizados = await obtenerUsuarioPorIdService(
            usuarioActual.id,
          );
          set({ usuario: datosActualizados });
        } catch (error) {
          console.error("Error al sincronizar el perfil:", error);
        }
      },

      logout: () =>
        set({
          token: null,
          usuario: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
