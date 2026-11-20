import { useEffect, useState, type FormEvent } from "react";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { extraerMensajeError } from "../../lib/errorHandle";
import {
  crearComentario,
  listarComentarios,
  type Comentario,
} from "../../services/comentarioService";
import type { UsuarioAutenticado } from "../../types/usuario";
import { estados } from "../../types/tarea";

const fechaComentario = (valor: string) =>
  new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(valor));

export function DetallesComentarios({
  idTarea,
  usuario,
  puedeInteractuar,
}: {
  idTarea: number;
  usuario: UsuarioAutenticado;
  puedeInteractuar: boolean;
}) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");

  useEffect(() => {
    let vigente = true;
    if (!puedeInteractuar) {
      return () => {
        vigente = false;
      };
    }
    listarComentarios(idTarea)
      .then((datos) => {
        if (vigente) {
          setComentarios(datos);
          setErrorCarga("");
        }
      })
      .catch((err: unknown) => {
        if (vigente)
          setErrorCarga(
            extraerMensajeError(err, "No se pudieron cargar los comentarios."),
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [idTarea, puedeInteractuar]);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulario = e.currentTarget;
    const campo = new FormData(formulario).get("comentario");
    const descripcion = typeof campo === "string" ? campo.trim() : "";
    if (!descripcion) {
      setErrorEnvio("Escribe un comentario antes de enviarlo.");
      return;
    }

    setEnviando(true);
    setErrorEnvio("");
    try {
      const creado = await crearComentario(idTarea, descripcion);
      setComentarios((actuales) => [
        ...actuales,
        {
          ...creado,
          autor: {
            id: usuario.id,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            rol: usuario.rol,
          },
        },
      ]);
      formulario.reset();
      toast.success("Comentario agregado");
    } catch (err) {
      setErrorEnvio(
        extraerMensajeError(err, "No se pudo agregar el comentario."),
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="fd-comments" aria-labelledby="fd-comments-title">
      <header className="fd-comments-heading">
        <h3 id="fd-comments-title">
          <MessageSquare size={18} />
          Comentarios
        </h3>
        <span className="fd-comments-count">
          {puedeInteractuar ? comentarios.length : 0}
        </span>
      </header>

      <div className="fd-comments-list" aria-live="polite">
        {puedeInteractuar && cargando && (
          <p role="status" className="fd-muted">
            Cargando comentarios…
          </p>
        )}
        {!cargando &&
          puedeInteractuar &&
          !errorCarga &&
          comentarios.length === 0 && (
            <p className="fd-comments-empty">
              Aún no hay comentarios. Inicia la conversación sobre este ticket.
            </p>
          )}
        {!cargando &&
          puedeInteractuar &&
          comentarios.map((comentario) => {
            const propio = comentario.autor.id === usuario.id;
            const autor = `${comentario.autor.nombres} ${comentario.autor.apellidos}`;
            return (
              <article
                className={`fd-comment ${propio ? "fd-comment-own" : ""}`}
                key={comentario.id}
              >
                <div className="fd-comment-meta">
                  <strong>{propio ? "Tú" : autor}</strong>
                  <time dateTime={comentario.fecha}>
                    {fechaComentario(comentario.fecha)}
                  </time>
                </div>
                {comentario.descripcion && (
                  <p className="fd-comment-message">
                    {comentario.descripcion}
                  </p>
                )}
                {comentario.estado_actual && (
                  <span className="fd-comment-status">
                    Estado: {estados[comentario.estado_actual]}
                  </span>
                )}
              </article>
            );
          })}
      </div>

      {errorCarga && puedeInteractuar && (
        <p role="alert" className="fd-error">
          {errorCarga}
          <button
            type="button"
            onClick={() => {
              setCargando(true);
              setErrorCarga("");
              listarComentarios(idTarea)
                .then((datos) => {
                  setComentarios(datos);
                  setErrorCarga("");
                })
                .catch((err: unknown) =>
                  setErrorCarga(
                    extraerMensajeError(
                      err,
                      "No se pudieron cargar los comentarios.",
                    ),
                  ),
                )
                .finally(() => setCargando(false));
            }}
          >
            Reintentar
          </button>
        </p>
      )}

      {puedeInteractuar ? (
        <form className="fd-comment-form" onSubmit={enviar}>
          <label className="fd-sr-only" htmlFor={`fd-comment-${idTarea}`}>
            Escribe un comentario
          </label>
          <textarea
            id={`fd-comment-${idTarea}`}
            name="comentario"
            rows={3}
            maxLength={500}
            placeholder="Escribe un comentario…"
            disabled={enviando}
            required
          />
          <div className="fd-comment-form-footer">
            <span className="fd-muted">Máximo 500 caracteres</span>
            <button className="fd-primary" disabled={enviando}>
              <Send size={16} />
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>
          {errorEnvio && (
            <p role="alert" className="fd-error">
              {errorEnvio}
            </p>
          )}
        </form>
      ) : (
        <p className="fd-muted">
          Los comentarios estarán disponibles cuando el ticket esté asignado a
          tu usuario.
        </p>
      )}
    </section>
  );
}
