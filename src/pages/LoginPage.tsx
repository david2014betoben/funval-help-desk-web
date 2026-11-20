import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, Sun, Moon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../hooks/useAuthStore";
import { loginAuthService } from "../services/authService";
import { extraerMensajeError } from "../lib/errorHandle";
import Logo from "../components/Logo";
import type { RolUsuario } from "../types/usuario";

// Mapa de redirección inicial según el rol del usuario
const RUTA_INICIAL_POR_ROL: Record<RolUsuario, string> = {
  ADMIN: "/dashboard",
  AGENTE: "/tareas",
  EMPLEADO: "/tareas",
};

export default function LoginPage() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Estado local sincronizado con la clase 'dark' del HTML
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const nuevoTema = !isDark;
    setIsDark(nuevoTema);
    document.documentElement.classList.toggle("dark", nuevoTema);
  };

  // Redirección si ya está autenticado
  if (isAuthenticated && usuario) {
    return (
      <Navigate
        to={RUTA_INICIAL_POR_ROL[usuario.rol] ?? "/dashboard"}
        replace
      />
    );
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      // 1. Autenticación en POST /auth/login
      const sesion = await loginAuthService({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // 2. Guarda token, decodifica ID y obtiene usuario fresco desde GET /usuario/:id
      const usuarioActual = await login(sesion.access_token);

      toast.success(`¡Bienvenido de nuevo, ${usuarioActual.nombres}!`);
      navigate(RUTA_INICIAL_POR_ROL[usuarioActual.rol] ?? "/dashboard", {
        replace: true,
      });
    } catch (err) {
      const msg = extraerMensajeError(
        err,
        "Credenciales incorrectas. Verifica tus datos.",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 lg:grid-cols-2">
      {/* LADO IZQUIERDO: Branding FunvalDesk (Oscuro + Destellos Azul y Magenta) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        {/* Efectos de luz ambiental Azul y Magenta */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-fuchsia-600/25 blur-3xl" />

        {/* Logo superior izquierdo */}
        <div className="relative z-10">
          <Logo size="md" title="FunvalDesk" subtitle="Mesa de Ayuda Virtual" />
        </div>

        {/* Mensaje central */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl leading-tight font-extrabold tracking-tight">
            Soporte técnico ágil y centralizado en un solo lugar.
          </h2>
          <p className="mt-4 text-slate-400">
            Gestiona tickets de atención, da seguimiento en tiempo real a tus
            solicitudes y optimiza la respuesta de tu equipo de soporte.
          </p>
        </div>

        {/* Métricas o indicadores de servicio */}
        <div className="relative z-10 flex gap-10 border-t border-white/10 pt-6 text-sm">
          <div>
            <p className="text-2xl font-extrabold text-blue-400">24/7</p>
            <p className="text-slate-400">Disponibilidad Virtual</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-fuchsia-400">&lt; 15m</p>
            <p className="text-slate-400">Tiempo de Respuesta</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">99.9%</p>
            <p className="text-slate-400">Tickets Resueltos</p>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Formulario de Inicio de Sesión */}
      <div className="relative flex flex-col justify-center p-6 sm:p-12">
        {/* Botón flotante para alternar tema Claro/Oscuro */}
        <div className="absolute top-6 right-6">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-fuchsia-400 hover:text-fuchsia-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-fuchsia-500 dark:hover:text-fuchsia-400"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-fuchsia-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mx-auto w-full max-w-sm">
          {/* Logo visible solo en dispositivos móviles */}
          <div className="mb-8 lg:hidden">
            <Logo
              size="md"
              title="FunvalDesk"
              subtitle="Mesa de Ayuda Virtual"
            />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Ingresa con tus credenciales de acceso a la mesa de ayuda.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Campo Correo */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="agente.soporte@helpdesk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Alerta visual de error */}
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Recordarme y Olvidaste contraseña */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-slate-600 select-none dark:text-slate-400">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-fuchsia-600"
                />
                Recordarme
              </label>

              <button
                type="button"
                onClick={() =>
                  toast.info("Recuperación de contraseña", {
                    description:
                      "Por seguridad, contáctate con el Administrador de Soporte para solicitar el reseteo de tu clave.",
                    duration: 6000,
                  })
                }
                className="cursor-pointer font-medium text-blue-600 hover:text-fuchsia-600 hover:underline dark:text-blue-400 dark:hover:text-fuchsia-400"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Submit con degradado azul a magenta */}
            <button
              type="submit"
              disabled={enviando}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{enviando ? "Ingresando..." : "Ingresar"}</span>
            </button>
          </form>
          {/* Pie de página de los creadores */}
          <footer className="mt-4 text-center">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              "Desarrollado por Equipo FUNVAL © 2026"
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
