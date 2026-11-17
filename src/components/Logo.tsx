import { Headset, Sparkles } from "lucide-react";

interface HelpDeskLogoProps {
  /** Tamaño del contenedor del ícono */
  size?: "sm" | "md" | "lg";
  /** Muestra u oculta el texto del logotipo */
  showText?: boolean;
  /** Título principal */
  title?: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Clases adicionales para el contenedor principal */
  className?: string;
}

const sizeMap = {
  sm: {
    box: "w-9 h-9 rounded-xl",
    icon: 20,
    badge: "w-3.5 h-3.5 -top-1 -right-1",
    sparkle: 9,
    title: "text-lg",
    subtitle: "text-[10px]",
  },
  md: {
    box: "w-11 h-11 rounded-2xl",
    icon: 24,
    badge: "w-4 h-4 -top-1 -right-1",
    sparkle: 10,
    title: "text-xl",
    subtitle: "text-[11px]",
  },
  lg: {
    box: "w-16 h-16 rounded-3xl",
    icon: 34,
    badge: "w-5 h-5 -top-1 -right-1",
    sparkle: 13,
    title: "text-3xl",
    subtitle: "text-xs",
  },
};

export default function Logo({
  size = "md",
  showText = true,
  title = "FunvalDesk",
  subtitle = "Mesa de Ayuda Virtual",
  className = "",
}: HelpDeskLogoProps) {
  const currentSize = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none group ${className}`}
      role="img"
      aria-label={`${title} - ${subtitle}`}
    >
      {/* Contenedor del ícono con degradado azul a magenta */}
      <div
        className={`relative flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-600 via-purple-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20 transition-transform duration-300 group-hover:scale-105 ${currentSize.box}`}
      >
        <Headset size={currentSize.icon} strokeWidth={2.2} />

        {/* Distintivo de asistencia virtual */}
        <span
          className={`absolute flex items-center justify-center rounded-full bg-fuchsia-500 ring-2 ring-white dark:ring-slate-900 ${currentSize.badge}`}
        >
          <Sparkles size={currentSize.sparkle} className="text-white" />
        </span>
      </div>

      {/* Texto del logotipo */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-fuchsia-600 bg-clip-text text-transparent ${currentSize.title}`}
          >
            {title}
          </span>
          {subtitle && (
            <span
              className={`font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${currentSize.subtitle}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
