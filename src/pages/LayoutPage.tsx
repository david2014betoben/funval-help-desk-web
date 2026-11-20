import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import { HeaderLayout } from "../components/Layout/HeaderLayout";
import { SideLayout, type MenuItem } from "../components/Layout/SideLayout";
import { useAuthStore } from "../hooks/useAuthStore";
import { useTema } from "../hooks/useTema";
import { useTareas } from "../hooks/useTareas";
import type { RolUsuario } from "../types/usuario";

interface RoleMenuItem extends MenuItem {
  allowedRoles?: RolUsuario[];
}

export default function LayoutPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDarkMode = useTema((state) => state.oscuro);
  const toggleTheme = useTema((state) => state.alternar);

  const usuario = useAuthStore((state) => state.usuario);
  const refrescarUsuario = useAuthStore((state) => state.refrescarUsuario);
  const logout = useAuthStore((state) => state.logout);
  const bandeja = useTareas(usuario?.id);

  useEffect(() => {
    void refrescarUsuario();
  }, [refrescarUsuario]);

  const userName = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : "Usuario";
  const userRole = usuario?.rol ?? "EMPLEADO";
  const mostrarBurbuja = userRole !== "EMPLEADO" && bandeja.nuevas > 0;

  const allMenuItems: RoleMenuItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["ADMIN", "AGENTE"],
    },
    {
      label: "Tickets / Tareas",
      path: "/tareas",
      icon: Ticket,
      badge: mostrarBurbuja ? bandeja.nuevas : undefined,
    },
    {
      label: "Categorías",
      path: "/categorias",
      icon: FolderKanban,
      allowedRoles: ["ADMIN", "AGENTE"],
    },
    {
      label: "Usuarios",
      path: "/usuarios",
      icon: Users,
      allowedRoles: ["ADMIN"],
    },
    {
      label: "Configuración",
      path: "/configuracion",
      icon: Settings,
      allowedRoles: ["ADMIN"],
    },
  ];

  const visibleMenuItems = allMenuItems.filter(
    (item) =>
      !item.allowedRoles?.length || item.allowedRoles.includes(userRole),
  );

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SideLayout
        menuItems={visibleMenuItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        creatorsText="Creado por DevTeam FUNVAL • v1.0"
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderLayout
          userName={userName}
          userRole={userRole}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet context={bandeja} />
          </div>
        </main>
      </div>
    </div>
  );
}
