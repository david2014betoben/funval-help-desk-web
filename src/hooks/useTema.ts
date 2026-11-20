import { create } from "zustand";

const clave = "funvaldesk:tema";

function leerTema(): boolean {
  try {
    const preferencia = localStorage.getItem(clave);
    if (preferencia === "dark" || preferencia === "light")
      return preferencia === "dark";
  } catch {
    // La preferencia del sistema sigue disponible.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function aplicarTema(oscuro: boolean) {
  document.documentElement.classList.toggle("dark", oscuro);
}

const inicial = leerTema();
aplicarTema(inicial);

export const useTema = create<{ oscuro: boolean; alternar: () => void }>(
  (set, get) => ({
    oscuro: inicial,
    alternar: () => {
      const oscuro = !get().oscuro;
      aplicarTema(oscuro);
      set({ oscuro });
      try {
        localStorage.setItem(clave, oscuro ? "dark" : "light");
      } catch {
        // El tema continúa activo durante la sesión.
      }
    },
  }),
);
