
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  X,
} from "lucide-react";
import { useNotificacionesStore } from "../../hooks/useNotificacionesStore";
import { useNotificacionesSocket } from "../../hooks/useNotificacionesSocket";

export default function CampanaNotificaciones() {
  useNotificacionesSocket();

  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const notificaciones = useNotificacionesStore(
    (state) => state.notificaciones
  );
  const cargando = useNotificacionesStore(
    (state) => state.cargando
  );
  const error = useNotificacionesStore(
    (state) => state.error
  );
  const obtenerNotificaciones = useNotificacionesStore(
    (state) => state.obtenerNotificaciones
  );
  const marcarComoLeida = useNotificacionesStore(
    (state) => state.marcarComoLeida
  );

  const [procesandoId, setProcesandoId] = useState<number | null>(
    null
  );

  const pendientes = notificaciones.filter(
    (notificacion) => !notificacion.leido
  ).length;

  const recientes = [...notificaciones]
    .sort(
      (a, b) =>
        new Date(b.created).getTime() -
        new Date(a.created).getTime()
    )
    .slice(0, 8);

  useEffect(() => {
    function cerrarAlHacerClickFuera(event: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    }

    function cerrarConEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAbierto(false);
      }
    }

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickFuera
    );
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickFuera
      );
      document.removeEventListener(
        "keydown",
        cerrarConEscape
      );
    };
  }, []);

  async function manejarMarcarComoLeida(id: number) {
    setProcesandoId(id);

    try {
      await marcarComoLeida(id);
    } finally {
      setProcesandoId(null);
    }
  }

  function formatearFecha(fecha: string) {
    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return "Fecha no disponible";
    }

    return fechaConvertida.toLocaleString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((anterior) => !anterior)}
        aria-label={`Notificaciones: ${pendientes} sin leer`}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        <Bell className="h-5 w-5" />

        {pendientes > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {pendientes > 99 ? "99+" : pendientes}
          </span>
        )}
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Panel de notificaciones"
          className="absolute right-0 top-12 z-50 w-[min(90vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Notificaciones
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendientes} sin leer
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void obtenerNotificaciones()}
                disabled={cargando}
                aria-label="Actualizar notificaciones"
                title="Actualizar"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    cargando ? "animate-spin" : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar notificaciones"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando && notificaciones.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-slate-500">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <p className="text-sm">
                  Cargando notificaciones...
                </p>
              </div>
            ) : recientes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <Bell className="h-9 w-9 text-slate-300" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No tienes notificaciones.
                </p>
              </div>
            ) : (
              recientes.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800 ${
                    !notificacion.leido
                      ? "bg-blue-50/70 dark:bg-blue-950/30"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      <MessageSquare className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Nuevo comentario
                        </p>

                        {!notificacion.leido && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
                            aria-label="Sin leer"
                          />
                        )}
                      </div>

                      <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                        {notificacion.comentario?.descripcion ??
                          "Tienes una nueva notificación."}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatearFecha(notificacion.created)}
                      </p>

                      {!notificacion.leido && (
                        <button
                          type="button"
                          disabled={procesandoId === notificacion.id}
                          onClick={() =>
                            void manejarMarcarComoLeida(
                              notificacion.id
                            )
                          }
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                        >
                          {procesandoId === notificacion.id ? (
                            <LoaderCircle className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="border-t border-red-100 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <div className="border-t border-slate-200 p-3 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Mostrando hasta 8 notificaciones recientes
          </div>
        </div>
      )}
    </div>
  );
}
