import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import type { useTareas } from "../hooks/useTareas";
import { EstadoTicket } from "../components/tareas/TareaDialogos";
import {
  esNueva,
  estados,
  fecha,
  nombre,
  prioridades,
  type Tarea,
} from "../types/tarea";
import "../components/tareas/modulos.css";

const series = [
  { estado: "ABIERTO", color: "bg-indigo-500", icono: CircleDot },
  { estado: "EN_PROCESO", color: "bg-fuchsia-500", icono: Clock },
  { estado: "RESUELTO", color: "bg-emerald-500", icono: CheckCircle2 },
  { estado: "CERRADO", color: "bg-slate-500", icono: Lock },
] as const;
const periodos = ["Hoy", "Últimos 7 días", "Todos"] as const;
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";
const enlace =
  "inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-300";

function estaActiva(tarea: Tarea) {
  return tarea.estado === "ABIERTO" || tarea.estado === "EN_PROCESO";
}

function porcentaje(cantidad: number, total: number) {
  return total ? (cantidad / total) * 100 : 0;
}

export default function DashboardPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const { tareas, cargando, error, recargar } =
    useOutletContext<ReturnType<typeof useTareas>>();
  const [periodo, setPeriodo] =
    useState<(typeof periodos)[number]>("Últimos 7 días");
  const admin = usuario?.rol === "ADMIN";
  const [referencia, setReferencia] = useState(() => Date.now());
  const desde = new Date(referencia);
  desde.setHours(0, 0, 0, 0);
  if (periodo === "Últimos 7 días") desde.setDate(desde.getDate() - 6);

  const propias = tareas.filter((tarea) => tarea.id_agente === usuario?.id);
  const activas = propias.filter(estaActiva);
  const visibles = (admin ? tareas : propias).filter(
    (tarea) =>
      periodo === "Todos" || Date.parse(tarea.created) >= desde.getTime(),
  );
  const totales = { ABIERTO: 0, EN_PROCESO: 0, RESUELTO: 0, CERRADO: 0 };
  const categorias = new Map<
    number,
    { nombre: string; id: number; total: number; estados: typeof totales }
  >();
  for (const tarea of visibles) {
    totales[tarea.estado]++;
    const categoria = categorias.get(tarea.id_categoria) ?? {
      id: tarea.id_categoria,
      nombre: tarea.categoria.sub_tipo,
      total: 0,
      estados: { ABIERTO: 0, EN_PROCESO: 0, RESUELTO: 0, CERRADO: 0 },
    };
    categoria.total++;
    categoria.estados[tarea.estado]++;
    categorias.set(tarea.id_categoria, categoria);
  }
  const barras = [...categorias.values()].sort((a, b) => b.total - a.total);
  const completados = totales.RESUELTO + totales.CERRADO;
  const avance = Math.round(porcentaje(completados, visibles.length));
  const tarjetas = admin
    ? series.map(({ estado, color, icono }) => ({
        titulo: estados[estado],
        cantidad: totales[estado],
        color,
        icono,
      }))
    : [
        {
          titulo: "Disponibles",
          cantidad: tareas.filter(esNueva).length,
          color: "bg-indigo-500",
          icono: CircleDot,
        },
        {
          titulo: "Mis tickets activos",
          cantidad: activas.length,
          color: "bg-fuchsia-500",
          icono: Clock,
        },
        {
          titulo: "Mi historial",
          cantidad: propias.length - activas.length,
          color: "bg-emerald-500",
          icono: CheckCircle2,
        },
      ];

  return (
    <section className="fd-module fd-stack">
      <header className="fd-heading">
        <div>
          <h1>
            {admin ? "Vista general de soporte" : "Mi actividad de soporte"}
          </h1>
          <p className="fd-muted">
            {admin
              ? "Consulta la distribución y el estado de los tickets."
              : "Consulta tu bandeja y tu actividad reciente."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
            aria-label="Periodo de creación"
            role="group"
          >
            {periodos.map((opcion) => (
              <button
                key={opcion}
                className={opcion === periodo ? "fd-primary" : ""}
                aria-pressed={opcion === periodo}
                onClick={() => setPeriodo(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>
          <button
            className="fd-icon"
            onClick={() => {
              setReferencia(Date.now());
              recargar();
            }}
            aria-label="Actualizar dashboard"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </header>

      {cargando && (
        <p className="fd-empty" role="status">
          Cargando métricas…
        </p>
      )}
      {error && (
        <div className="fd-error" role="alert">
          {error} <button onClick={recargar}>Reintentar</button>
        </div>
      )}
      {!cargando && (!error || tareas.length > 0) && (
        <>
          <div
            className={`grid gap-4 sm:grid-cols-2 ${admin ? "xl:grid-cols-4" : "lg:grid-cols-3"}`}
          >
            {tarjetas.map(({ titulo, cantidad, color, icono: Icono }) => (
              <div className={`${panel} relative overflow-hidden`} key={titulo}>
                <span
                  className={`pointer-events-none absolute -right-2 -top-7 h-24 w-24 rounded-full opacity-15 blur-xl ${color}`}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <span className="fd-muted font-semibold uppercase tracking-wide">
                    {titulo}
                  </span>
                  <div className={`rounded-lg p-2 text-white ${color}`}>
                    <Icono size={17} />
                  </div>
                </div>
                <div className="mt-2 text-3xl font-bold tabular-nums">
                  {cantidad}
                </div>
                {admin && (
                  <div
                    className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{
                        width: `${porcentaje(cantidad, visibles.length)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {admin ? (
            <div className="grid gap-4 xl:grid-cols-3">
              <section className={`${panel} space-y-5 xl:col-span-2`}>
                <h2>Tickets por categoría</h2>
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {series.map(({ estado, color }) => (
                    <li
                      key={estado}
                      className="fd-muted flex items-center gap-2"
                    >
                      <span className={`size-2 rounded-full ${color}`} />
                      {estados[estado]}
                    </li>
                  ))}
                </ul>
                {barras.length === 0 && (
                  <p className="fd-muted">
                    Sin tickets para el periodo seleccionado.
                  </p>
                )}
                {barras.map((barra) => (
                  <div className="space-y-2" key={barra.id}>
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <span>{barra.nombre}</span>
                      <span>{barra.total}</span>
                    </div>
                    <div
                      className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                      role="img"
                      aria-label={series
                        .map(
                          ({ estado }) =>
                            `${estados[estado]}: ${barra.estados[estado]}`,
                        )
                        .join(", ")}
                    >
                      {series.map(
                        ({ estado, color }) =>
                          barra.estados[estado] > 0 && (
                            <span
                              key={estado}
                              className={color}
                              style={{
                                width: `${porcentaje(barra.estados[estado], barras[0].total)}%`,
                              }}
                              title={`${estados[estado]}: ${barra.estados[estado]}`}
                            />
                          ),
                      )}
                    </div>
                  </div>
                ))}
              </section>
              <section className={`${panel} space-y-4`}>
                <h2>Tickets completados</h2>
                <div
                  className="mx-auto grid size-36 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
                  style={
                    visibles.length
                      ? {
                          backgroundImage: `conic-gradient(#10b981 ${avance}%, transparent 0)`,
                        }
                      : undefined
                  }
                >
                  <div className="grid size-29 place-items-center rounded-full bg-white text-3xl font-bold dark:bg-slate-900">
                    {visibles.length ? `${avance}%` : "—"}
                  </div>
                </div>
                <p className="fd-muted text-center">
                  {completados} de {visibles.length} tickets del periodo
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                    <dt>Resueltos</dt>
                    <dd>{totales.RESUELTO}</dd>
                  </div>
                  <div className="flex justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                    <dt>Cerrados</dt>
                    <dd>{totales.CERRADO}</dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <section className={`${panel} space-y-3`}>
              <h2>
                {activas.length
                  ? "Ticket en atención"
                  : "No tienes tickets activos"}
              </h2>
              {activas.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <strong>
                    #{activas[0].id} · {activas[0].titulo}
                  </strong>
                  <EstadoTicket estado={activas[0].estado} />
                  <span className="fd-muted">
                    Prioridad {prioridades[activas[0].prioridad].toLowerCase()}
                  </span>
                </div>
              )}
              <Link
                className={enlace}
                to={activas.length ? "/tareas?bandeja=activos" : "/tareas"}
              >
                Abrir bandeja <ArrowRight size={16} />
              </Link>
            </section>
          )}

          <section className={`${panel} space-y-4`}>
            <div className="fd-heading">
              <h2>{admin ? "Tickets recientes" : "Mi actividad reciente"}</h2>
              <Link className={enlace} to="/tareas">
                Ver todos los tickets <ArrowRight size={16} />
              </Link>
            </div>
            {!visibles.length ? (
              <p className="fd-empty">
                Sin tickets para el periodo seleccionado.
              </p>
            ) : (
              <div className="fd-table">
                <table>
                  <thead>
                    <tr>
                      {[
                        "Ticket",
                        "Categoría",
                        "Estado",
                        "Agente",
                        "Creado",
                      ].map((columna) => (
                        <th key={columna} scope="col">
                          {columna}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.slice(0, 5).map((tarea) => (
                      <tr key={tarea.id}>
                        <td>
                          <span className="fd-number mr-2">#{tarea.id}</span>
                          {tarea.titulo}
                        </td>
                        <td>{tarea.categoria.sub_tipo}</td>
                        <td>
                          <EstadoTicket estado={tarea.estado} />
                        </td>
                        <td>
                          {tarea.agente ? nombre(tarea.agente) : "Sin asignar"}
                        </td>
                        <td>{fecha(tarea.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
