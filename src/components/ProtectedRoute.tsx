import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import type { RolUsuario } from "../types/usuario";

interface ProtectedRouteProps {
  allowedRoles?: RolUsuario[];
  redirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectTo = "/tareas", // Ruta segura por defecto si no tiene el rol requerido
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const usuario = useAuthStore((s) => s.usuario);

  // 1. Si no está autenticado o no hay datos del usuario, redirige al Login
  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si se especificaron roles y el usuario no tiene permiso, redirige a una ruta segura
  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to={redirectTo} replace />;
  }

  // 3. Renderiza las rutas hijas protegidas
  return <Outlet />;
}
