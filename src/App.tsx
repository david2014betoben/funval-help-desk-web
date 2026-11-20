import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useTema } from "./hooks/useTema";
import DashboardPage from "./pages/DashboardPage";
import CategoriasPage from "./pages/CategoriasPage";
import LayoutPage from "./pages/LayoutPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import TareasPage from "./pages/TareasPage";
import UsuarioPage from "./pages/UsuarioPage";

export default function App() {
  const oscuro = useTema((state) => state.oscuro);
  return (
    <>
      <Toaster
        theme={oscuro ? "dark" : "light"}
        richColors
        position="top-right"
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutPage />}>
            <Route path="/tareas" element={<TareasPage />} />

            <Route
              element={<ProtectedRoute allowedRoles={["ADMIN", "AGENTE"]} />}
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/usuarios" element={<UsuarioPage />} />
              <Route
                path="/configuracion"
                element={<div>Configuración del Sistema</div>}
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
