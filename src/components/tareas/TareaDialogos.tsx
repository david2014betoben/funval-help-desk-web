import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { extraerMensajeError } from "../../lib/errorHandle";
import {
  actualizarTarea,
  crearTarea,
  listarTareas,
  obtenerTarea,
} from "../../services/tareaService";
import {
  esNueva,
  estados,
  fecha,
  nombre,
  prioridades,
  tipos,
  type Categoria,
  type Tarea,
} from "../../types/tarea";
import type { Usuario, UsuarioAutenticado } from "../../types/usuario";
import { Dialogo } from "./Dialogo";

export function EstadoTicket({ estado }: { estado: Tarea["estado"] }) {
  return (
    <span className={`fd-chip fd-${estado.toLowerCase()}`}>
      {estados[estado]}
    </span>
  );
}

const siguiente = {
  ABIERTO: "EN_PROCESO",
  EN_PROCESO: "RESUELTO",
  RESUELTO: "CERRADO",
  CERRADO: null,
} as const;

export function DetalleTarea({
  inicial,
  usuario,
  agentes,
  tieneActiva,
  cerrar,
  revisar,
  recargar,
}: {
  inicial: Tarea;
  usuario: UsuarioAutenticado;
  agentes: Usuario[];
  tieneActiva: boolean;
  cerrar: () => void;
  revisar: (id: number) => void;
  recargar: () => void;
}) {
  const [tarea, setTarea] = useState(inicial);
  const [agente, setAgente] = useState(inicial.id_agente?.toString() ?? "");
  const [ocupado, setOcupado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [error, setError] = useState("");
  const [verificada, setVerificada] = useState(false);
  const id = inicial.id;
  useEffect(() => {
    let vigente = true;
    obtenerTarea(id)
      .then((dato) => {
        if (!vigente) return;
        setTarea(dato);
        setAgente(dato.id_agente?.toString() ?? "");
        setVerificada(true);
      })
      .catch((err: unknown) => {
        if (vigente)
          setError(extraerMensajeError(err, "No se pudo cargar el detalle."));
      })
      .finally(() => {
        if (vigente) setVerificando(false);
      });
    return () => {
      vigente = false;
    };
  }, [id]);
  const admin = usuario.rol === "ADMIN";
  const esAgente = usuario.rol === "AGENTE";
  const propia = esAgente && tarea.id_agente === usuario.id;
  const nueva = esNueva(tarea);
  const proximo = siguiente[tarea.estado];
  const puedeActuar = verificada && !ocupado && !verificando;
  async function guardar(idAgente: number, estado?: Tarea["estado"]) {
    setOcupado(true);
    setError("");
    try {
      if (esAgente && nueva) {
        const actuales = await listarTareas();
        const activa = actuales.some(
          (ticket) =>
            ticket.id_agente === usuario.id &&
            (ticket.estado === "ABIERTO" || ticket.estado === "EN_PROCESO"),
        );
        if (activa)
          throw new Error("Completa tu ticket activo para tomar uno nuevo.");
        if (
          !actuales.some((ticket) => ticket.id === tarea.id && esNueva(ticket))
        ) {
          throw new Error("Este ticket ya no está disponible.");
        }
      }
      const actualizada = await actualizarTarea(tarea.id, {
        id_agente: idAgente,
        estado,
      });
      setTarea(actualizada);
      toast.success("Ticket actualizado");
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo actualizar el ticket."));
    } finally {
      recargar();
      setOcupado(false);
    }
  }
  const campos = [
    ["Solicitante", nombre(tarea.empleado)],
    ["Agente", tarea.agente ? nombre(tarea.agente) : "Sin asignar"],
    [
      "Categoría",
      `${tipos[tarea.categoria.tipo]} · ${tarea.categoria.sub_tipo}`,
    ],
    ["Prioridad", prioridades[tarea.prioridad]],
    ["Creación", fecha(tarea.created, true)],
    ["Última actualización", fecha(tarea.updated, true)],
    ...(tarea.resueltoEn
      ? [["Resolución", fecha(tarea.resueltoEn, true)]]
      : []),
    ...(tarea.cerradoEn ? [["Cierre", fecha(tarea.cerradoEn, true)]] : []),
  ];
  return (
    <Dialogo
      titulo={`Detalle del ticket #${id}`}
      lateral={usuario.rol !== "EMPLEADO"}
      ocupado={ocupado}
      cerrar={cerrar}
    >
      <div className="fd-stack">
        <EstadoTicket estado={tarea.estado} />
        <h3 className="fd-ticket-title">{tarea.titulo}</h3>
        <p className="fd-description">{tarea.descripcion}</p>
        <dl className="fd-detail-grid">
          {campos.map(([campo, valor]) => (
            <div key={campo}>
              <dt>{campo}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
        {verificando && (
          <p role="status" className="fd-muted">
            Actualizando detalles…
          </p>
        )}
        {error && (
          <p role="alert" className="fd-error">
            {error}
          </p>
        )}
        {admin && proximo && (
          <section className="fd-section">
            <label>
              Agente asignado
              <select
                value={agente}
                onChange={(e) => setAgente(e.target.value)}
                disabled={ocupado}
              >
                <option value="">Selecciona un agente</option>
                {tarea.agente &&
                  !agentes.some((opcion) => opcion.id === tarea.id_agente) && (
                    <option value={tarea.id_agente ?? ""} disabled>
                      {nombre(tarea.agente)}
                    </option>
                  )}
                {agentes.map((opcion) => (
                  <option value={opcion.id} key={opcion.id}>
                    {nombre(opcion)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="fd-primary"
              disabled={
                !puedeActuar ||
                !agentes.some((opcion) => opcion.id === Number(agente))
              }
              onClick={() =>
                void guardar(
                  Number(agente),
                  tarea.estado === "ABIERTO" ? "EN_PROCESO" : undefined,
                )
              }
            >
              {tarea.agente ? "Actualizar asignación" : "Asignar ticket"}
            </button>
          </section>
        )}
        {esAgente && nueva && (
          <section className="fd-section">
            {tieneActiva && (
              <p className="fd-muted">
                Completa tu ticket activo para tomar uno nuevo.
              </p>
            )}
            <button
              className="fd-primary"
              disabled={!puedeActuar || tieneActiva}
              onClick={() => void guardar(usuario.id, "EN_PROCESO")}
            >
              Tomar ticket
            </button>
          </section>
        )}
        {propia && proximo && (
          <button
            className="fd-primary"
            disabled={!puedeActuar}
            onClick={() => void guardar(usuario.id, proximo)}
          >
            {
              {
                EN_PROCESO: "Iniciar atención",
                RESUELTO: "Marcar como resuelto",
                CERRADO: "Cerrar ticket",
              }[proximo]
            }
          </button>
        )}
        {ocupado && <p role="status">Guardando cambios…</p>}
        {/* Integrar aquí el componente de comentarios con tarea.id. */}
        <div className="fd-placeholder">Aquí van los comentarios</div>
      </div>
      {verificada && <MarcarRevisada id={id} revisar={revisar} />}
    </Dialogo>
  );
}

function MarcarRevisada({
  id,
  revisar,
}: {
  id: number;
  revisar: (id: number) => void;
}) {
  useEffect(() => {
    revisar(id);
  }, [id, revisar]);
  return null;
}

export function NuevaTarea({
  categorias,
  cerrar,
  guardada,
}: {
  categorias: Categoria[];
  cerrar: () => void;
  guardada: () => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const campos = new FormData(e.currentTarget);
    const titulo = String(campos.get("titulo") ?? "").trim();
    const descripcion = String(campos.get("descripcion") ?? "").trim();
    const prioridad = String(campos.get("prioridad") ?? "") as
      | keyof typeof prioridades
      | "";
    if (titulo.length < 3 || !descripcion) {
      setError("Escribe un título de al menos 3 caracteres y una descripción.");
      return;
    }
    setOcupado(true);
    setError("");
    try {
      await crearTarea({
        titulo,
        descripcion,
        id_categoria: Number(campos.get("categoria")),
        prioridad: prioridad || undefined,
      });
      toast.success("Solicitud creada");
      guardada();
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo crear la solicitud."));
      setOcupado(false);
    }
  }
  return (
    <Dialogo
      titulo="Crear nueva solicitud de soporte"
      ocupado={ocupado}
      cerrar={cerrar}
    >
      <form onSubmit={enviar} className="fd-stack">
        <label>
          Título
          <input
            name="titulo"
            required
            minLength={3}
            maxLength={255}
            placeholder="Resume el problema o requerimiento"
          />
        </label>
        <label>
          Descripción
          <textarea
            name="descripcion"
            required
            rows={5}
            placeholder="Describe qué pasó y cuándo empezó"
          />
        </label>
        <label>
          Categoría
          <select name="categoria" required defaultValue="">
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {tipos[cat.tipo]} · {cat.sub_tipo}
              </option>
            ))}
          </select>
        </label>
        <label>
          Prioridad
          <select name="prioridad" defaultValue="">
            <option value="">Predeterminada (media)</option>
            {Object.entries(prioridades).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p role="alert" className="fd-error">
            {error}
          </p>
        )}
        <footer className="fd-actions">
          <button type="button" disabled={ocupado} onClick={cerrar}>
            Cancelar
          </button>
          <button
            className="fd-primary"
            disabled={ocupado || categorias.length === 0}
          >
            {ocupado ? "Enviando…" : "Crear solicitud"}
          </button>
        </footer>
      </form>
    </Dialogo>
  );
}
