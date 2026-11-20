import api from "../lib/axios";
import type {
  Categoria,
  CategoriaInput,
  Tarea,
  TareaInput,
} from "../types/tarea";

export const listarTareas = async () =>
  (await api.get<Tarea[]>("/tareas")).data;
export const obtenerTarea = async (id: number) =>
  (await api.get<Tarea>(`/tareas/${id}`)).data;
export const crearTarea = async (input: TareaInput) =>
  (await api.post<Tarea>("/tareas", input)).data;
export const actualizarTarea = async (
  id: number,
  input: { id_agente: number; estado?: Tarea["estado"] },
) => (await api.patch<Tarea>(`/tareas/${id}`, input)).data;
export const listarCategorias = async () =>
  (await api.get<Categoria[]>("/categorias")).data;
export async function guardarCategoria(input: CategoriaInput, id?: number) {
  if (id !== undefined)
    return (await api.patch<Categoria>(`/categorias/${id}`, input)).data;
  return (await api.post<Categoria>("/categorias", input)).data;
}
export const eliminarCategoria = async (id: number) => {
  await api.delete(`/categorias/${id}`);
};
