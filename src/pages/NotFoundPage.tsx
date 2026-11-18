import { useNavigate } from "react-router-dom";
import { Headset, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center transition-colors duration-300">
      {/* Contenedor principal de la ilustración 404 */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto mb-2 select-none">
        {/* 1. ICONO ARRIBA: Con degradado sutil azul a magenta */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20 flex items-center justify-center shrink-0 shadow-sm">
          <Headset className="h-7 w-7" strokeWidth={2.2} />
        </div>

        {/* 2. TEXTO 404 GIGANTE: Degradado translúcido azul a magenta */}
        <div className="text-[9rem] sm:text-[11rem] md:text-[12rem] font-black tracking-tighter leading-none bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-fuchsia-600/20 dark:from-blue-500/20 dark:to-fuchsia-500/20 bg-clip-text text-transparent">
          404
        </div>
      </div>

      {/* Mensaje de Error */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        Página no encontrada
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        Lo sentimos, la sección que estás buscando no existe o ha sido movida
        temporalmente en nuestra mesa de ayuda.
      </p>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-fuchsia-400 hover:text-fuchsia-600 dark:hover:border-fuchsia-500 dark:hover:text-fuchsia-400 active:scale-[0.98] transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver atrás</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 rounded-xl shadow-md shadow-fuchsia-500/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Ir al Inicio</span>
        </button>
      </div>
    </div>
  );
}
