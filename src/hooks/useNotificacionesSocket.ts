
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import { useNotificacionesStore } from "./useNotificacionesStore";
import type { Notificacion } from "../types/notificacion";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://funval-help-desk-api.onrender.com";

export function useNotificacionesSocket() {
  const usuarioId = useAuthStore((state) => state.usuario?.id);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const obtenerNotificaciones = useNotificacionesStore(
    (state) => state.obtenerNotificaciones
  );

  useEffect(() => {
    if (!isAuthenticated || !token || !usuarioId) {
      return;
    }

    const socket = io(`${SOCKET_URL}/notificaciones`, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });


    function recibirNotificacion(
      notificacion: Notificacion
    ) {
      if (
        !notificacion ||
        notificacion.id_usuario !== usuarioId
      ) {
        return;
      }

      useNotificacionesStore
        .getState()
        .agregarNotificacion(notificacion);
    }

    function manejarError(error: Error) {
      console.error(
        "Error de conexión con notificaciones:",
        error.message
      );
    }

    socket.on("nuevaNotificacion", recibirNotificacion);
    socket.on("connect_error", manejarError);

    socket.connect();

    return () => {
      socket.off("nuevaNotificacion", recibirNotificacion);
      socket.off("connect_error", manejarError);
      socket.disconnect();
    };
  }, [isAuthenticated, token, usuarioId]);

  useEffect(() => {
    if (!isAuthenticated || !token || !usuarioId) {
      useNotificacionesStore
        .getState()
        .limpiarNotificaciones();
      return;
    }

    void obtenerNotificaciones();
  }, [
    isAuthenticated,
    token,
    usuarioId,
    obtenerNotificaciones,
  ]);
}
