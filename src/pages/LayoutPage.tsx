import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  FolderKanban,
  Settings,
} from "lucide-react";
import { HeaderLayout } from "../components/Layout/HeaderLayout";
import { SideLayout } from "../components/Layout/SideLayout";
import type { MenuItem } from "../components/Layout/SideLayout";
import { useAuthStore } from "../hooks/useAuthStore";
import type { RolUsuario } from "../types/usuario";

interface RoleMenuItem extends MenuItem {
  allowedRoles?: RolUsuario[];
}

export default function LayoutPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  // Conectado directamente a tu estado global en Zustand
  const usuario = useAuthStore((s) => s.usuario);
  const refrescarUsuario = useAuthStore((s) => s.refrescarUsuario);
  const logout = useAuthStore((s) => s.logout);

  // Sincroniza los datos frescos del usuario desde GET /usuario/:id al montar
  useEffect(() => {
    refrescarUsuario();
  }, [refrescarUsuario]);

  // Lógica para aplicar clase 'dark' al HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Datos reales del usuario autenticado
  const userName = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : "Usuario";
  const userRole = usuario?.rol ?? "EMPLEADO";

  // Configuración centralizada de los ítems del menú con roles reales en MAYÚSCULAS
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
      badge: 5,
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

  // Filtra los ítems permitidos según el rol real del usuario
  const visibleMenuItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return item.allowedRoles.includes(userRole);
    });
  }, [userRole]);

  // Limpia sesión en Zustand y redirige al Login
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
