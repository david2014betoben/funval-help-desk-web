import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LayoutPage from "./pages/LayoutPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import UsuarioPage from "./pages/UsuarioPage";

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas privadas (requieren sesión iniciada) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutPage />}>
            {/* Accesibles para todos los usuarios autenticados */}
            <Route
              path="/tareas"
              element={<div>Gestión de Tickets / Tareas</div>}
            />

            {/* Solo ADMINISTRADOR y AGENTE */}
            <Route
              element={<ProtectedRoute allowedRoles={["ADMIN", "AGENTE"]} />}
            >
              <Route
                path="/dashboard"
                element={<div>Vista General del Dashboard</div>}
              />
              <Route
                path="/categorias"
                element={<div>Gestión de Categorías</div>}
              />
            </Route>

            {/* Solo ADMINISTRADOR */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/usuarios" element={<UsuarioPage />} />
              <Route
                path="/configuracion"
                element={<div>Configuración del Sistema</div>}
              />
            </Route>

            {/* Ruta 404 dentro del layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
