import {
  Pencil,
  Trash2,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { Usuario, RolUsuario } from "../../types/usuario";

interface UsuarioCardProps {
  usuario: Usuario;
  esUsuarioActual: boolean;
  onEditar: (usuario: Usuario) => void;
  onEliminar: (usuario: Usuario) => void;
}

const getRolStyle = (rol: RolUsuario) => {
  const estilos: Record<RolUsuario, string> = {
    ADMIN:
      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:border-fuchsia-800",
    AGENTE:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    EMPLEADO:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  };
  return estilos[rol] ?? estilos.EMPLEADO;
};

export default function UsuarioCard({
  usuario,
  esUsuarioActual,
  onEditar,
  onEliminar,
}: UsuarioCardProps) {
  const esActivo = usuario.estado === "ACTIVO";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-fuchsia-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-fuchsia-500/50">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-fuchsia-600 text-lg font-extrabold text-white shadow-sm">
              {usuario.nombres.charAt(0).toUpperCase()}
              {usuario.apellidos.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3
                title={`${usuario.nombres} ${usuario.apellidos}`}
                className="font-bold text-slate-900 dark:text-white line-clamp-1"
              >
                {usuario.nombres} {usuario.apellidos}
              </h3>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getRolStyle(usuario.rol)}`}
              >
                <Shield className="h-3 w-3" />
                {usuario.rol}
              </span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${esActivo ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"}`}
          >
            {esActivo ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {usuario.estado}
          </span>
        </div>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{usuario.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ID: #{usuario.id}</span>
            <span>Género: {usuario.masculino ? "Masculino" : "Femenino"}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onEditar(usuario)}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Editar</span>
        </button>

        <button
          type="button"
          onClick={() => onEliminar(usuario)}
          disabled={esUsuarioActual}
          title={
            esUsuarioActual
              ? "No puedes eliminar tu propio usuario"
              : "Eliminar usuario"
          }
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
}
