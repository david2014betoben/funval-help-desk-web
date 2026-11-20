import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Search,
  Ticket,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import type { useTareas } from "../hooks/useTareas";
import { extraerMensajeError } from "../lib/errorHandle";
import { listarCategorias } from "../services/tareaService";
import { obtenerUsuariosService } from "../services/usuarioService";
import {
  DetalleTarea,
  EstadoTicket,
  NuevaTarea,
} from "../components/tareas/TareaDialogos";
import {
  esNueva,
  estados,
  fecha,
  nombre,
  prioridades,
  type Categoria,
  type Tarea,
} from "../types/tarea";
import type { Usuario } from "../types/usuario";
import "../components/tareas/modulos.css";

const filtrosIniciales = {
  buscar: "",
  estado: "",
  prioridad: "",
  categoria: "",
  empleado: "",
  agente: "",
  desde: "",
  hasta: "",
};
const pestanas = ["Nuevos", "Mis tickets activos", "Historial"] as const;
const porPagina = 10;

export default function TareasPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const bandeja = useOutletContext<ReturnType<typeof useTareas>>();
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [pagina, setPagina] = useState(1);
  const [params, setParams] = useSearchParams();
  const bandejaActiva = params.get("bandeja");
  const pestana =
    bandejaActiva === "activos"
      ? "Mis tickets activos"
      : bandejaActiva === "historial"
        ? "Historial"
        : "Nuevos";
  const [seleccionada, setSeleccionada] = useState<Tarea | null>(null);
  const [nueva, setNueva] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [agentes, setAgentes] = useState<Usuario[]>([]);
  const [errorCatalogo, setErrorCatalogo] = useState("");
  const [revisionCatalogo, setRevisionCatalogo] = useState(0);
  const rol = usuario?.rol;
  useEffect(() => {
    let vigente = true;
    listarCategorias()
      .then((datos) => {
        if (vigente) setCategorias(datos);
      })
      .catch((err: unknown) => {
        if (vigente)
          setErrorCatalogo(
            extraerMensajeError(err, "No se pudieron cargar las categorías."),
          );
      });
    if (rol === "ADMIN") {
      obtenerUsuariosService()
        .then((datos) => {
          if (vigente)
            setAgentes(
              datos.filter(
                (persona) =>
                  persona.rol === "AGENTE" && persona.estado === "ACTIVO",
              ),
            );
        })
        .catch((err: unknown) => {
          if (vigente)
            setErrorCatalogo(
              extraerMensajeError(err, "No se pudieron cargar los agentes."),
            );
        });
    }
    return () => {
      vigente = false;
    };
  }, [rol, revisionCatalogo]);
  if (!usuario) return null;

  const admin = rol === "ADMIN";
  const empleado = rol === "EMPLEADO";
  const { tareas, cargando, error, recargar, marcarRevisada, idsNuevas } =
    bandeja;
  const propias = tareas.filter((tarea) => tarea.id_agente === usuario.id);
  const historial = propias.filter(
    (tarea) => tarea.estado === "RESUELTO" || tarea.estado === "CERRADO",
  );
  const activas = propias.filter(
    (tarea) => tarea.estado === "ABIERTO" || tarea.estado === "EN_PROCESO",
  );
  const grupos = {
    Nuevos: tareas.filter(esNueva),
    "Mis tickets activos": activas,
    Historial: historial,
  };
  const lista = rol === "AGENTE" ? grupos[pestana] : tareas;
  const solicitantes = [
    ...new Map(
      tareas.flatMap((tarea) =>
        tarea.empleado ? [[tarea.empleado.id, tarea.empleado] as const] : [],
      ),
    ).values(),
  ];
  const asignados = [
    ...new Map(
      tareas.flatMap((tarea) =>
        tarea.agente ? [[tarea.agente.id, tarea.agente] as const] : [],
      ),
    ).values(),
  ];
  const texto = filtros.buscar.trim().toLocaleLowerCase();
  const filtradas = lista.filter((tarea) => {
    const dia = new Date(tarea.created).toLocaleDateString("sv-SE");
    return (
      (!texto ||
        tarea.titulo.toLocaleLowerCase().includes(texto) ||
        String(tarea.id).includes(texto.replace(/^#/, ""))) &&
      (!filtros.estado || tarea.estado === filtros.estado) &&
      (!filtros.prioridad || tarea.prioridad === filtros.prioridad) &&
      (!filtros.categoria ||
        String(tarea.id_categoria) === filtros.categoria) &&
      (!filtros.empleado || String(tarea.empleado?.id) === filtros.empleado) &&
      (!filtros.agente ||
        (filtros.agente === "sin"
          ? tarea.id_agente === null
          : String(tarea.id_agente) === filtros.agente)) &&
      (!filtros.desde || dia >= filtros.desde) &&
      (!filtros.hasta || dia <= filtros.hasta)
    );
  });
  const paginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const actual = Math.min(pagina, paginas);
  const visibles = filtradas.slice(
    (actual - 1) * porPagina,
    actual * porPagina,
  );

  function cambiar(campo: keyof typeof filtros, valor: string) {
    setFiltros((previo) => ({ ...previo, [campo]: valor }));
    setPagina(1);
  }
  function seleccionar(
    campo: keyof typeof filtros,
    etiqueta: string,
    opciones: [string | number, string][],
  ) {
    return (
      <label>
        {etiqueta}
        <select
          value={filtros[campo]}
          onChange={(e) => cambiar(campo, e.target.value)}
        >
          <option value="">Todos</option>
          {opciones.map(([valor, textoOpcion]) => (
            <option key={valor} value={valor}>
              {textoOpcion}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <section className="fd-module fd-stack">
      <header className="fd-heading">
        <div>
          <h1>
            {admin
              ? "Gestión de Tickets / Tareas"
              : empleado
                ? "Mis Solicitudes de Soporte"
                : "Bandeja de Trabajo del Agente"}
          </h1>
          <p className="fd-muted">
            {admin
              ? "Consulta, filtra y asigna las solicitudes de soporte."
              : empleado
                ? "Revisa el estado de tus solicitudes y quién las está atendiendo."
                : "Consulta los tickets disponibles y da seguimiento a tus asignaciones."}
          </p>
        </div>
        {empleado && (
          <button
            className="fd-primary"
            onClick={() => setNueva(true)}
            disabled={categorias.length === 0}
          >
            <Plus size={18} /> Nueva solicitud
          </button>
        )}
      </header>

      {rol === "AGENTE" && activas.length > 0 && (
        <aside className="fd-active">
          <div>
            <small>Ticket en atención</small>
            <strong>{activas[0].titulo}</strong>
          </div>
          <button onClick={() => setSeleccionada(activas[0])}>
            Ver ticket #{activas[0].id}
          </button>
        </aside>
      )}
      {rol === "AGENTE" && (
        <nav className="fd-tabs" aria-label="Bandejas de tickets">
          {pestanas.map((opcion) => (
            <button
              key={opcion}
              aria-pressed={pestana === opcion}
              onClick={() => {
                setParams(
                  opcion === "Nuevos"
                    ? {}
                    : {
                        bandeja:
                          opcion === "Historial" ? "historial" : "activos",
                      },
                  { replace: true },
                );
                setPagina(1);
                setFiltros(filtrosIniciales);
              }}
            >
              {opcion} <span>{grupos[opcion].length}</span>
            </button>
          ))}
        </nav>
      )}

      <div className={`fd-filters ${admin ? "fd-filters-admin" : ""}`}>
        <label>
          Búsqueda{" "}
          <div className="fd-search">
            <Search size={16} />
            <input
              value={filtros.buscar}
              onChange={(e) => cambiar("buscar", e.target.value)}
              placeholder="Número o título del ticket"
            />
          </div>
        </label>
        {seleccionar("estado", "Estado", Object.entries(estados))}
        {!empleado &&
          seleccionar(
            "categoria",
            "Categoría",
            categorias.map((cat) => [cat.id, cat.sub_tipo]),
          )}
        {!empleado &&
          seleccionar("prioridad", "Prioridad", Object.entries(prioridades))}
        {admin && (
          <>
            {seleccionar(
              "empleado",
              "Solicitante",
              solicitantes.map((persona) => [persona.id, nombre(persona)]),
            )}
            {seleccionar("agente", "Agente", [
              ["sin", "Sin asignar"],
              ...asignados.map((persona): [number, string] => [
                persona.id,
                nombre(persona),
              ]),
            ])}
            <label>
              Desde
              <input
                type="date"
                value={filtros.desde}
                max={filtros.hasta || undefined}
                onChange={(e) => cambiar("desde", e.target.value)}
              />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={filtros.hasta}
                min={filtros.desde || undefined}
                onChange={(e) => cambiar("hasta", e.target.value)}
              />
            </label>
          </>
        )}
        <button
          onClick={() => {
            setFiltros(filtrosIniciales);
            setPagina(1);
          }}
        >
          Limpiar filtros
        </button>
      </div>

      {errorCatalogo && (
        <div role="alert" className="fd-error">
          {errorCatalogo}{" "}
          <button
            onClick={() => {
              setErrorCatalogo("");
              setRevisionCatalogo((valor) => valor + 1);
            }}
          >
            Reintentar
          </button>
        </div>
      )}
      {error && (
        <div role="alert" className="fd-error">
          {error} <button onClick={recargar}>Reintentar</button>
        </div>
      )}
      {cargando && (
        <p role="status" className="fd-empty">
          Cargando tickets…
        </p>
      )}
      {!cargando && !error && visibles.length === 0 && (
        <div className="fd-empty">
          <Ticket size={24} />
          {lista.length
            ? "No hay tickets que coincidan con los filtros."
            : "Todavía no hay tickets en esta vista."}
        </div>
      )}

      {empleado && visibles.length > 0 && (
        <div className="fd-cards">
          {visibles.map((tarea) => (
            <button
              className="fd-card"
              key={tarea.id}
              onClick={() => setSeleccionada(tarea)}
            >
              <span className="fd-heading">
                <span className="fd-number">#{tarea.id}</span>
                <EstadoTicket estado={tarea.estado} />
              </span>
              <strong>{tarea.titulo}</strong>
              <span className="fd-muted">{tarea.categoria.sub_tipo}</span>
              <span className="fd-card-footer">
                <span>
                  <Clock size={15} />
                  {fecha(tarea.created)}
                </span>
                <span>
                  <UserRound size={15} />
                  {tarea.agente
                    ? nombre(tarea.agente)
                    : "Pendiente de asignación"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      {!empleado && visibles.length > 0 && (
        <div className="fd-table">
          <table>
            <thead>
              <tr>
                {[
                  "Ticket",
                  "Solicitante",
                  "Categoría",
                  "Prioridad",
                  "Estado",
                  ...(admin ? ["Agente"] : []),
                  "Creado",
                ].map((columna) => (
                  <th key={columna} scope="col">
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((tarea) => (
                <tr key={tarea.id} onClick={() => setSeleccionada(tarea)}>
                  <td>
                    <button
                      className="fd-ticket-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeleccionada(tarea);
                      }}
                    >
                      <span className="fd-number inline-flex items-center gap-2">
                        #{tarea.id}
                        {idsNuevas.has(tarea.id) && (
                          <span className="inline-flex" title="Sin revisar">
                            <span
                              aria-hidden="true"
                              className="size-2 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400"
                            />
                            <span className="sr-only">Sin revisar</span>
                          </span>
                        )}
                      </span>
                      {tarea.titulo}
                    </button>
                  </td>
                  <td>{nombre(tarea.empleado)}</td>
                  <td>{tarea.categoria.sub_tipo}</td>
                  <td>
                    <span
                      className={`fd-chip fd-${tarea.prioridad.toLowerCase()}`}
                    >
                      {prioridades[tarea.prioridad]}
                    </span>
                  </td>
                  <td>
                    <EstadoTicket estado={tarea.estado} />
                  </td>
                  {admin && (
                    <td>
                      {tarea.agente ? nombre(tarea.agente) : "Sin asignar"}
                    </td>
                  )}
                  <td>{fecha(tarea.created)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtradas.length > 0 && (
        <footer className="fd-pagination">
          <span>
            {(actual - 1) * porPagina + 1}–
            {Math.min(actual * porPagina, filtradas.length)} de{" "}
            {filtradas.length} tickets
          </span>
          <div className="fd-actions">
            <button
              disabled={actual <= 1}
              onClick={() => setPagina(actual - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {actual} / {paginas}
            </span>
            <button
              disabled={actual >= paginas}
              onClick={() => setPagina(actual + 1)}
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}
      {seleccionada && (
        <DetalleTarea
          key={seleccionada.id}
          inicial={seleccionada}
          usuario={usuario}
          agentes={agentes}
          tieneActiva={activas.length > 0}
          revisar={marcarRevisada}
          recargar={recargar}
          cerrar={() => setSeleccionada(null)}
        />
      )}
      {nueva && (
        <NuevaTarea
          categorias={categorias}
          cerrar={() => setNueva(false)}
          guardada={() => {
            setNueva(false);
            setFiltros(filtrosIniciales);
            setPagina(1);
            recargar();
          }}
        />
      )}
    </section>
  );
}
