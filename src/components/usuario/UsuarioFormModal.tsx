import React, { useState, useEffect } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type {
  Usuario,
  RolUsuario,
  EstadoUsuario,
  CreateUsuarioInput,
  UpdateUsuarioInput,
} from "../../types/usuario";

interface UsuarioFormModalProps {
  abierto: boolean;
  usuarioEditando: Usuario | null;
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (datos: CreateUsuarioInput | UpdateUsuarioInput) => Promise<void>;
}

const ROLES: RolUsuario[] = ["ADMIN", "AGENTE", "EMPLEADO"];
const ESTADOS: EstadoUsuario[] = ["ACTIVO", "INACTIVO", "SUSPENDIDO"];

export default function UsuarioFormModal({
  abierto,
  usuarioEditando,
  guardando,
  onCerrar,
  onGuardar,
}: UsuarioFormModalProps) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("EMPLEADO");
  const [masculino, setMasculino] = useState(true);
  const [estado, setEstado] = useState<EstadoUsuario>("ACTIVO");
  const [verPassword, setVerPassword] = useState(false);

  useEffect(() => {
    if (usuarioEditando) {
      setNombres(usuarioEditando.nombres);
      setApellidos(usuarioEditando.apellidos);
      setEmail(usuarioEditando.email);
      setPassword("");
      setRol(usuarioEditando.rol);
      setMasculino(usuarioEditando.masculino);
      setEstado(usuarioEditando.estado);
    } else {
      setNombres("");
      setApellidos("");
      setEmail("");
      setPassword("");
      setRol("EMPLEADO");
      setMasculino(true);
      setEstado("ACTIVO");
      setVerPassword(false);
    }
  }, [usuarioEditando, abierto]);

  if (!abierto) return null;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usuarioEditando && password.trim().length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const payload: UpdateUsuarioInput = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      rol,
      masculino,
      estado,
    };

    if (password.trim()) payload.password = password.trim();
    await onGuardar(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {usuarioEditando
              ? `Editar Usuario #${usuarioEditando.id}`
              : "Registrar Nuevo Usuario"}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nombres
              </label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Jose"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:border-fuchsia-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Apellidos
              </label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Perez"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:border-fuchsia-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Correo electrónico
            </label>
            <input
              type="email"
              name="nuevo_usuario_email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@helpdesk.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:border-fuchsia-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {usuarioEditando ? "Nueva contraseña (opcional)" : "Contraseña"}
            </label>
            <div className="relative">
              <input
                type={verPassword ? "text" : "password"}
                required={!usuarioEditando}
                name="nuevo_usuario_password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  usuarioEditando
                    ? "Dejar vacío para mantener"
                    : "Mínimo 6 caracteres"
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-3.5 text-sm focus:border-fuchsia-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => setVerPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-fuchsia-600"
                aria-label={
                  verPassword ? "Ocultar contraseña" : "Ver contraseña"
                }
              >
                {verPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rol
              </label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as RolUsuario)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoUsuario)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                {ESTADOS.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Género
              </label>
              <select
                value={String(masculino)}
                onChange={(e) => setMasculino(e.target.value === "true")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-fuchsia-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="true">Masculino</option>
                <option value="false">Femenino</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 hover:opacity-95 disabled:opacity-60"
            >
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {guardando
                  ? "Guardando..."
                  : usuarioEditando
                    ? "Guardar Cambios"
                    : "Registrar Usuario"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
