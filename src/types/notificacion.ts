export interface ComentarioNotificacion {
  id: number;
  descripcion: string | null;
  estado_actual: string | null;
  fecha: string;
  updated: string;
  id_autor: number;
  id_tarea: number;
}

export interface Notificacion {
  id: number;
  leido: boolean;
  created: string;
  updated: string;
  id_comentario: number;
  id_usuario: number;
  comentario: ComentarioNotificacion;
}