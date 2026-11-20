export const estados = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
} as const;
export const prioridades = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
} as const;
export const tipos = {
  INCIDENCIA: "Incidencia",
  REQUERIMIENTO: "Requerimiento",
} as const;

export type CategoriaInput = { tipo: keyof typeof tipos; sub_tipo: string };
export type Categoria = CategoriaInput & { id: number };
export type TareaInput = {
  titulo: string;
  descripcion: string;
  id_categoria: number;
  prioridad?: keyof typeof prioridades;
};
export type Tarea = Required<TareaInput> & {
  id: number;
  estado: keyof typeof estados;
  created: string;
  updated: string;
  resueltoEn: string | null;
  cerradoEn: string | null;
  id_agente: number | null;
  categoria: Categoria;
  empleado: Persona | null;
  agente: Persona | null;
};
type Persona = { id: number; nombres: string; apellidos: string };
export const nombre = (persona: Persona | null) =>
  persona ? `${persona.nombres} ${persona.apellidos}` : "—";
export const esNueva = (tarea: Tarea) =>
  tarea.estado === "ABIERTO" && tarea.id_agente === null;
export const fecha = (valor: string, hora = false) =>
  new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    ...(hora ? { timeStyle: "short" } : {}),
  }).format(new Date(valor));
