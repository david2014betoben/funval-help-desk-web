import { Menu, Sun, Moon, UserCheck } from "lucide-react";

interface HeaderLayoutProps {
  userName: string;
  userRole: string;
  onOpenSidebar: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function HeaderLayout({
  userName,
  userRole,
  onOpenSidebar,
  isDarkMode = false,
  onToggleTheme,
}: HeaderLayoutProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      {/* Izquierda: Botón hamburguesa (solo visible en móvil/tablet) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Abrir menú lateral"
        >
          <Menu className="h-6 w-6" />
        </button>

        <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:inline-block">
          Panel de Control
        </span>
      </div>

      {/* Derecha: Espacio para botón Dark/Light + Datos del Usuario */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Espacio / Botón para Dark / Light Mode */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-fuchsia-400 hover:text-fuchsia-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-fuchsia-500 dark:hover:text-fuchsia-400"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Separador vertical */}
        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Información del usuario: Nombres y Rol */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
              {userName}
            </span>
            <span className="inline-flex items-center justify-end gap-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-fuchsia-600 bg-clip-text text-transparent">
              {userRole}
            </span>
          </div>

          {/* Avatar con iniciales o ícono */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-fuchsia-600 text-white font-bold shadow-sm">
            {userName ? (
              userName.charAt(0).toUpperCase()
            ) : (
              <UserCheck className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
