import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import PageNotFound from "./pages/PageNotFound";
import PageLayout from "./pages/PageLayout";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Redirección opcional si entran a la raíz "/" */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rutas protegidas que comparten el HeaderLayout y SideLayout */}
        <Route element={<PageLayout />}>
          <Route
            path="/dashboard"
            element={<div>Vista General del Dashboard</div>}
          />
          <Route
            path="/tareas"
            element={<div>Gestión de Tickets / Tareas</div>}
          />
          <Route
            path="/categorias"
            element={<div>Gestión de Categorías</div>}
          />
          <Route path="/usuarios" element={<div>Gestión de Usuarios</div>} />
          <Route
            path="/configuracion"
            element={<div>Configuración del Sistema</div>}
          />

          <Route path="*" element={<PageNotFound />} />
        </Route>

        {/* Rutas públicas (sin Sidebar ni Header) */}
        <Route path="/login" element={<div>Página Login</div>} />

        {/* Ruta 404 */}
      </Routes>
    </>
  );
}

export default App;
