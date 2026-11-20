import { useCallback, useEffect, useState } from "react";
import { extraerMensajeError } from "../lib/errorHandle";
import { listarTareas } from "../services/tareaService";
import { esNueva, type Tarea } from "../types/tarea";

function leerRevisadas(clave: string): number[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(clave) ?? "[]");
    return Array.isArray(ids)
      ? ids.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

export function useTareas(usuarioId: number | undefined) {
  const clave = `funvaldesk:tareas-revisadas:${usuarioId}`;
  const [revisadas, setRevisadas] = useState(() => leerRevisadas(clave));
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const recargar = useCallback(() => setRevision((actual) => actual + 1), []);

  useEffect(() => {
    if (!usuarioId) return;
    let vigente = true;
    let pendiente = false;
    async function consultar() {
      if (pendiente) return;
      pendiente = true;
      try {
        const datos = await listarTareas();
        if (vigente) {
          setTareas(
            datos.sort(
              (a, b) =>
                Date.parse(b.created) - Date.parse(a.created) || b.id - a.id,
            ),
          );
          setError("");
        }
      } catch (err) {
        if (vigente)
          setError(
            extraerMensajeError(err, "No se pudieron cargar los tickets."),
          );
      } finally {
        pendiente = false;
        if (vigente) setCargando(false);
      }
    }
    void consultar();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void consultar();
    }, 30000);
    return () => {
      vigente = false;
      window.clearInterval(timer);
    };
  }, [usuarioId, revision]);

  const marcarRevisada = useCallback(
    (id: number) => {
      const guardadas = leerRevisadas(clave);
      if (!guardadas.includes(id)) {
        try {
          localStorage.setItem(clave, JSON.stringify([...guardadas, id]));
        } catch {
          /* Sigue funcionando en memoria. */
        }
      }
      setRevisadas((ids) => (ids.includes(id) ? ids : [...ids, id]));
    },
    [clave],
  );

  const idsNuevas = new Set(
    tareas
      .filter((tarea) => esNueva(tarea) && !revisadas.includes(tarea.id))
      .map((tarea) => tarea.id),
  );

  return {
    tareas,
    cargando,
    error,
    recargar,
    marcarRevisada,
    idsNuevas,
    nuevas: idsNuevas.size,
  };
}
