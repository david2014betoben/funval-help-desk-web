import { NavLink } from "react-router-dom";
import { LogOut, X, type LucideIcon } from "lucide-react";
import Logo from "../Logo";

export interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface SideLayoutProps {
  menuItems: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  creatorsText?: string;
}

export function SideLayout({
  menuItems,
  isOpen,
  onClose,
  onLogout,
  creatorsText = "Desarrollado por Equipo FUNVAL © 2026",
}: SideLayoutProps) {
  return (
    <>
      {/* Fondo oscuro (Backdrop) para móviles cuando el menú está abierto */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Esquina superior izquierda: Logo + Botón cerrar en móvil */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Logo size="sm" title="FunvalDesk" subtitle="Mesa de Ayuda" />

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de futuros ítems del menú */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menú Principal
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // Cierra el sidebar automáticamente en móviles al navegar
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs font-bold text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Zona inferior: Botón de cierre de sesión y Pie de página */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>

          {/* Pie de página de los creadores */}
          <footer className="mt-4 text-center">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {creatorsText}
            </p>
          </footer>
        </div>
      </aside>
    </>
  );
}
