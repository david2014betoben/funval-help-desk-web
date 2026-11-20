import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialogo({
  titulo,
  lateral = false,
  ocupado = false,
  cerrar,
  children,
}: {
  titulo: string;
  lateral?: boolean;
  ocupado?: boolean;
  cerrar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialogo = ref.current;
    dialogo?.showModal();
    return () => dialogo?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      className={`fd-dialog ${lateral ? "fd-drawer" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        if (!ocupado) cerrar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !ocupado) cerrar();
      }}
    >
      <section className="fd-dialog-inner">
        <header className="fd-heading">
          <h2 id={id}>{titulo}</h2>
          <button
            type="button"
            className="fd-icon"
            aria-label="Cerrar ventana"
            disabled={ocupado}
            onClick={cerrar}
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </dialog>
  );
}
