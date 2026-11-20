import { useEffect, useState, type FormEvent } from "react";
import { Folder, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialogo } from "../components/tareas/Dialogo";
import { extraerMensajeError } from "../lib/errorHandle";
import {
  eliminarCategoria,
  guardarCategoria,
  listarCategorias,
} from "../services/tareaService";
import { tipos, type Categoria, type CategoriaInput } from "../types/tarea";
import "../components/tareas/modulos.css";

type Accion =
  | { tipo: "crear" }
  | { tipo: "editar" | "eliminar"; categoria: Categoria };

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [buscar, setBuscar] = useState("");
  const [tipo, setTipo] = useState("");
  const [accion, setAccion] = useState<Accion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let vigente = true;
    listarCategorias()
      .then((datos) => {
        if (vigente) setCategorias(datos);
      })
      .catch((err: unknown) => {
        if (vigente)
          setError(
            extraerMensajeError(err, "No se pudieron cargar las categorías."),
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [revision]);

  const visibles = categorias.filter(
    (cat) =>
      (!tipo || tipo === cat.tipo) &&
      cat.sub_tipo
        .toLocaleLowerCase()
        .includes(buscar.trim().toLocaleLowerCase()),
  );
  const seleccionada =
    accion && accion.tipo !== "crear" ? accion.categoria : undefined;
  const eliminando = accion?.tipo === "eliminar";

  function abrir(nueva: Accion) {
    setErrorAccion("");
    setAccion(nueva);
  }
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const sub_tipo = String(datos.get("sub_tipo") ?? "").trim();
    if (!eliminando && sub_tipo.length < 2) {
      setErrorAccion("Escribe un subtipo de al menos 2 caracteres.");
      return;
    }
    setOcupado(true);
    setErrorAccion("");
    try {
      if (eliminando && seleccionada) {
        await eliminarCategoria(seleccionada.id);
        setCategorias((lista) =>
          lista.filter((cat) => cat.id !== seleccionada.id),
        );
        toast.success("Categoría eliminada");
      } else {
        const guardada = await guardarCategoria(
          { sub_tipo, tipo: datos.get("tipo") as CategoriaInput["tipo"] },
          seleccionada?.id,
        );
        setCategorias((lista) =>
          seleccionada
            ? lista.map((cat) => (cat.id === guardada.id ? guardada : cat))
            : [...lista, guardada],
        );
        toast.success(
          seleccionada ? "Categoría actualizada" : "Categoría creada",
        );
      }
      setAccion(null);
    } catch (err) {
      setErrorAccion(
        extraerMensajeError(err, "No se pudo completar la operación."),
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="fd-module fd-stack">
      <header className="fd-heading">
        <div>
          <h1>Gestión de Categorías de Soporte</h1>
          <p className="fd-muted">
            Organiza las incidencias y los requerimientos de la mesa de ayuda.
          </p>
        </div>
        <button className="fd-primary" onClick={() => abrir({ tipo: "crear" })}>
          <Plus size={18} /> Nueva categoría
        </button>
      </header>
      <div className="fd-filters">
        <label>
          Búsqueda
          <div className="fd-search">
            <Search size={16} />
            <input
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por subtipo"
            />
          </div>
        </label>
        <label>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(tipos).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setTipo("");
            setBuscar("");
          }}
        >
          Limpiar filtros
        </button>
      </div>
      {cargando && (
        <p className="fd-empty" role="status">
          Cargando categorías…
        </p>
      )}
      {error && (
        <div className="fd-error" role="alert">
          {error}{" "}
          <button
            onClick={() => {
              setError("");
              setCargando(true);
              setRevision((valor) => valor + 1);
            }}
          >
            Reintentar
          </button>
        </div>
      )}
      {!cargando && !error && visibles.length === 0 && (
        <div className="fd-empty">
          <Folder size={24} />
          {categorias.length
            ? "No hay categorías que coincidan con los filtros."
            : "Crea una categoría para clasificar las solicitudes."}
        </div>
      )}
      {visibles.length > 0 && (
        <div className="fd-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Subtipo</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <span
                      className={`fd-chip ${cat.tipo === "INCIDENCIA" ? "fd-en_proceso" : "fd-abierto"}`}
                    >
                      {tipos[cat.tipo]}
                    </span>
                  </td>
                  <td className="font-medium">{cat.sub_tipo}</td>
                  <td>
                    <div className="fd-actions fd-row-actions">
                      <button
                        className="fd-icon"
                        aria-label={`Editar ${cat.sub_tipo}`}
                        onClick={() =>
                          abrir({ tipo: "editar", categoria: cat })
                        }
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="fd-icon fd-trash"
                        aria-label={`Eliminar ${cat.sub_tipo}`}
                        onClick={() =>
                          abrir({ tipo: "eliminar", categoria: cat })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {accion && (
        <Dialogo
          titulo={
            eliminando
              ? "Eliminar categoría"
              : seleccionada
                ? "Editar categoría"
                : "Nueva categoría"
          }
          ocupado={ocupado}
          cerrar={() => setAccion(null)}
        >
          <form className="fd-stack" onSubmit={enviar}>
            {eliminando ? (
              <p>
                ¿Eliminar la categoría <strong>{seleccionada?.sub_tipo}</strong>
                ?
              </p>
            ) : (
              <>
                <label>
                  Tipo
                  <select
                    name="tipo"
                    defaultValue={seleccionada?.tipo ?? "INCIDENCIA"}
                  >
                    {Object.entries(tipos).map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>
                        {etiqueta}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Subtipo
                  <input
                    name="sub_tipo"
                    required
                    minLength={2}
                    maxLength={200}
                    defaultValue={seleccionada?.sub_tipo}
                    placeholder="Ej. Hardware"
                  />
                </label>
              </>
            )}
            {errorAccion && (
              <p role="alert" className="fd-error">
                {errorAccion}
              </p>
            )}
            <footer className="fd-actions">
              <button
                type="button"
                disabled={ocupado}
                onClick={() => setAccion(null)}
              >
                Cancelar
              </button>
              <button
                className={eliminando ? "fd-danger" : "fd-primary"}
                disabled={ocupado}
              >
                {ocupado
                  ? "Procesando…"
                  : eliminando
                    ? "Eliminar"
                    : "Guardar categoría"}
              </button>
            </footer>
          </form>
        </Dialogo>
      )}
    </section>
  );
}
