
import { create } from "zustand";
import type { Notificacion } from "../types/notificacion";
import {
  obtenerNotificacionesService,
  marcarNotificacionLeidaService,
} from "../services/notificacionesService";

interface NotificacionesState {
  notificaciones: Notificacion[];
  cargando: boolean;
  error: string | null;

  obtenerNotificaciones: () => Promise<void>;
  marcarComoLeida: (id: number) => Promise<void>;
  agregarNotificacion: (notificacion: Notificacion) => void;
  limpiarNotificaciones: () => void;
}

export const useNotificacionesStore =
  create<NotificacionesState>((set) => ({
    notificaciones: [],
    cargando: false,
    error: null,

    obtenerNotificaciones: async () => {
      set({ cargando: true, error: null });

      try {
        const datos = await obtenerNotificacionesService();

        set({
          notificaciones: datos,
          cargando: false,
        });
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);

        set({
          cargando: false,
          error: "No se pudieron cargar las notificaciones.",
        });
      }
    },

    marcarComoLeida: async (id) => {
      try {
        await marcarNotificacionLeidaService(id);

        set((state) => ({
          notificaciones: state.notificaciones.map(
            (notificacion) =>
              notificacion.id === id
                ? { ...notificacion, leido: true }
                : notificacion
          ),
          error: null,
        }));
      } catch (error) {
        console.error("Error al marcar notificación:", error);

        set({
          error: "No se pudo marcar la notificación como leída.",
        });
      }
    },

    agregarNotificacion: (notificacion) => {
      set((state) => {
        const existe = state.notificaciones.some(
          (item) => item.id === notificacion.id
        );

        if (existe) {
          return state;
        }

        return {
          notificaciones: [
            notificacion,
            ...state.notificaciones,
          ],
        };
      });
    },

    limpiarNotificaciones: () => {
      set({
        notificaciones: [],
        cargando: false,
        error: null,
      });
    },
  }));
