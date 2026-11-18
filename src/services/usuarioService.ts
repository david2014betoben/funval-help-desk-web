import api from "../lib/axios";
import type {
  Usuario,
  CreateUsuarioInput,
  UpdateUsuarioInput,
} from "../types/usuario";

// 1. Obtener todos los usuarios (GET /usuario)
export async function obtenerUsuariosService(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>("/usuario");
  return data;
}

// 2. Obtener un usuario por ID (GET /usuario/:id)
export async function obtenerUsuarioPorIdService(id: number): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/usuario/${id}`);
  console.log("data ==> ", data);

  return data;
}

// 3. Crear un nuevo usuario (POST /usuario)
export async function crearUsuarioService(
  datos: CreateUsuarioInput,
): Promise<Usuario> {
  const { data } = await api.post<Usuario>("auth/register", datos);
  return data;
}

// 4. Actualizar usuario parcialmente (PATCH /usuario/:id)
export async function actualizarUsuarioService(
  id: number,
  datos: UpdateUsuarioInput,
): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuario/${id}`, datos);
  return data;
}

// 5. Eliminar usuario (DELETE /usuario/:id)
export async function eliminarUsuarioService(id: number): Promise<void> {
  await api.delete(`/usuario/${id}`);
}
