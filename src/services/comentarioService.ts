import api from "../lib/axios";

export type Comentario = {
  id: number;
  descripcion: string | null;
  estado_actual: "ABIERTO" | "EN_PROCESO" | "RESUELTO" | "CERRADO" | null;
  fecha: string;
  autor: {
    id: number;
    nombres: string;
    apellidos: string;
    rol: "ADMIN" | "AGENTE" | "EMPLEADO";
  };
};

export type ComentarioCreado = Pick<
  Comentario,
  "id" | "descripcion" | "estado_actual" | "fecha"
>;

export const listarComentarios = async (idTarea: number) =>
  (await api.get<Comentario[]>(`/tarea/${idTarea}/comentarios`)).data;

export const crearComentario = async (idTarea: number, descripcion: string) =>
  (
    await api.post<ComentarioCreado>(`/tarea/${idTarea}/comentarios`, {
      descripcion,
    })
  ).data;
