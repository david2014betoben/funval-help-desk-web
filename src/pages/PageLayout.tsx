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

// Definición extendida para controlar visibilidad por rol
interface RoleMenuItem extends MenuItem {
  allowedRoles?: string[]; // Si no se especifica, es visible para todos
}

export default function PageLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Ejemplo de datos del usuario (puedes conectarlos a tu Context, Redux o Zustand)
  const currentUser = {
    name: "María Cordova",
    role: "Administrador",
  };

  // Lógica para aplicar clase 'dark' al HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Configuración centralizada de los futuros ítems del menú
  const allMenuItems: RoleMenuItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
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
      allowedRoles: ["Administrador", "Agente"],
    },
    {
      label: "Usuarios",
      path: "/usuarios",
      icon: Users,
      allowedRoles: ["Administrador"],
    },
    {
      label: "Configuración",
      path: "/configuracion",
      icon: Settings,
      allowedRoles: ["Administrador"],
    },
  ];

  // Lógica para presentar los ítems permitidos según el rol del usuario
  const visibleMenuItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return item.allowedRoles.includes(currentUser.role);
    });
  }, [currentUser.role]);

  const handleLogout = () => {
    // Aquí limpias tu token (localStorage.removeItem('token'), etc.)
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Barra Lateral */}
      <SideLayout
        menuItems={visibleMenuItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        creatorsText="Creado por DevTeam FUNVAL • v1.0"
      />

      {/* Contenedor Principal (Header + Contenido dinámico) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderLayout
          userName={currentUser.name}
          userRole={currentUser.role}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        />

        {/* Área donde se renderizan las vistas hijas de React Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
