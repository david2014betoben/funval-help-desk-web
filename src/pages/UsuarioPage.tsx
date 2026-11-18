import { useEffect, useState, useMemo } from "react";
import { UserPlus, Search, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  obtenerUsuariosService,
  crearUsuarioService,
  actualizarUsuarioService,
  eliminarUsuarioService,
} from "../services/usuarioService";
import { useAuthStore } from "../hooks/useAuthStore";
import { extraerMensajeError } from "../lib/errorHandle";
import UsuarioCard from "../components/usuario/UsuarioCard";
import UsuarioFormModal from "../components/usuario/UsuarioFormModal";
import type {
  Usuario,
  RolUsuario,
  CreateUsuarioInput,
  UpdateUsuarioInput,
} from "../types/usuario";

const ROLES: RolUsuario[] = ["ADMIN", "AGENTE", "EMPLEADO"];

export default function UsuarioPage() {
  const usuarioLogueado = useAuthStore((s) => s.usuario);
  const refrescarUsuario = useAuthStore((s) => s.refrescarUsuario);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("TODOS");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerUsuariosService()
      .then(setUsuarios)
      .catch((err) =>
        toast.error(
          extraerMensajeError(err, "No se pudieron cargar los usuarios."),
        ),
      )
      .finally(() => setCargando(false));
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchTexto = `${u.nombres} ${u.apellidos} ${u.email}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const matchRol = filtroRol === "TODOS" || u.rol === filtroRol;
      return matchTexto && matchRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const handleGuardar = async (
    datos: CreateUsuarioInput | UpdateUsuarioInput,
  ) => {
    setGuardando(true);
    try {
      if (usuarioEditando) {
        const actualizado = await actualizarUsuarioService(
          usuarioEditando.id,
          datos,
        );
        setUsuarios((prev) =>
          prev.map((u) => (u.id === actualizado.id ? actualizado : u)),
        );
        if (usuarioEditando.id === usuarioLogueado?.id)
          await refrescarUsuario();
        toast.success("Usuario actualizado correctamente.");
      } else {
        const creado = await crearUsuarioService(datos as CreateUsuarioInput);
        setUsuarios((prev) => [creado, ...prev]);
        toast.success("Usuario registrado con éxito.");
      }
      setModalAbierto(false);
    } catch (err) {
      toast.error(extraerMensajeError(err, "Error al guardar el usuario."));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (usuario: Usuario) => {
    if (!window.confirm(`¿Eliminar a ${usuario.nombres} ${usuario.apellidos}?`))
      return;
    try {
      await eliminarUsuarioService(usuario.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      toast.success("Usuario eliminado.");
    } catch (err) {
      toast.error(extraerMensajeError(err, "No se pudo eliminar el usuario."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra los accesos, roles y estados de la plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setUsuarioEditando(null);
            setModalAbierto(true);
          }}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 hover:opacity-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Usuario</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm focus:border-fuchsia-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium focus:border-fuchsia-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="TODOS">Todos los roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {cargando ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600" />
          <p className="text-sm font-medium">Cargando usuarios...</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Users className="mb-3 h-10 w-10 text-slate-400" />
          <p className="font-bold text-slate-800 dark:text-slate-200">
            No se encontraron usuarios
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {usuariosFiltrados.map((user) => (
            <UsuarioCard
              key={user.id}
              usuario={user}
              esUsuarioActual={user.id === usuarioLogueado?.id}
              onEditar={(u) => {
                setUsuarioEditando(u);
                setModalAbierto(true);
              }}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}

      <UsuarioFormModal
        abierto={modalAbierto}
        usuarioEditando={usuarioEditando}
        guardando={guardando}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={handleGuardar}
      />
    </div>
  );
}
