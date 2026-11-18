// Tipos literales para restringir los valores permitidos
export type RolUsuario = "ADMIN" | "AGENTE" | "EMPLEADO";

export type EstadoUsuario = "ACTIVO" | "INACTIVO" | "SUSPENDIDO";

// Type principal para el Usuario
export type Usuario = {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: RolUsuario;
  masculino: boolean;
  estado: EstadoUsuario;
  created?: string;
  updated?: string;
};

// Type extendido para Usuario Autenticado
export type UsuarioAutenticado = Omit<
  Usuario,
  "password" | "created" | "updated"
>;

// Type extendido para Crear un Usuario (Formulario)
export type CreateUsuarioInput = Omit<Usuario, "id" | "created" | "updated">;

// Type extendido para Actualizar un Usuario (Formulario)
export type UpdateUsuarioInput = Partial<CreateUsuarioInput>;

// Type extendido para Loguear a un Usuario
export type UsuarioLogin = Pick<Usuario, "password" | "email">;
