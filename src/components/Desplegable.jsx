import { ChevronDown } from "lucide-react";
import { COLORS } from "../colors";

// Selector tipo "desplegable": muestra el valor actual cerrado por default
// (con badge "Actual" si aplica) y, al tocarlo, despliega las demás
// opciones — mismo mecanismo <details>/<summary> que ya usa la sección
// "Grupos", en vez de una fila de chips que hay que scrollear para
// encontrar cuál está seleccionado.
export function Desplegable({ eyebrow, valorLabel, esActualValor, opciones, onSeleccionar }) {
  const handleSeleccionar = (e, id) => {
    onSeleccionar(id);
    e.currentTarget.closest("details")?.removeAttribute("open");
  };

  return (
    <details
      className="group rounded-2xl mb-2.5 overflow-hidden"
      style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
    >
      <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: COLORS.lima }}>
            {eyebrow}
          </span>
          <span className="text-sm font-black flex items-center gap-1.5" style={{ color: COLORS.crema }}>
            {valorLabel}
            {esActualValor && (
              <span
                className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                style={{ background: COLORS.lima, color: COLORS.tinta }}
              >
                Actual
              </span>
            )}
          </span>
        </div>
        <ChevronDown size={16} color={COLORS.limaSoft} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-1.5 pb-1.5 flex flex-col gap-0.5" style={{ borderTop: `1px solid ${COLORS.linea}` }}>
        {opciones.map((op) => (
          <button
            key={op.id}
            onClick={(e) => handleSeleccionar(e, op.id)}
            className="text-left mt-1.5 px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between"
            style={{
              background: op.seleccionado ? "rgba(212,245,71,0.14)" : "transparent",
              color: op.seleccionado ? COLORS.lima : COLORS.crema,
            }}
          >
            {op.label}
            {op.actual && (
              <span
                className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                style={{ background: COLORS.lima, color: COLORS.tinta }}
              >
                Actual
              </span>
            )}
          </button>
        ))}
      </div>
    </details>
  );
}
