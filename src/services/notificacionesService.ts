import api from "../lib/axios";
import type { Notificacion } from "../types/notificacion";

// Obtener las notificaciones del usuario autenticado.
export async function obtenerNotificacionesService(): Promise<
  Notificacion[]
> {
  const { data } = await api.get<Notificacion[]>(
    "/notificaciones"
  );

  return data;
}

// Marcar una notificación como leída.
export async function marcarNotificacionLeidaService(
  id: number
): Promise<Notificacion> {
  const { data } = await api.patch<Notificacion>(
    `/notificaciones/${id}/leida`
  );

  return data;
}