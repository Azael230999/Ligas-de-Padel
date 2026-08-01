import { crearResultado } from "@/app/actions";
import { COLORS } from "@/lib/colors";
import { Rotacion } from "@/lib/pairings";

export function ResultadoForm({
  grupoId,
  rotaciones,
  admin,
}: {
  grupoId: number;
  rotaciones: Rotacion[];
  admin: boolean;
}) {
  if (!admin || rotaciones.length === 0) return null;

  return (
    <details className="rounded-2xl overflow-hidden" style={{ border: `1px dashed ${COLORS.linea}` }}>
      <summary
        className="px-4 py-3 text-sm font-bold cursor-pointer"
        style={{ color: COLORS.lima }}
      >
        + Agregar resultado
      </summary>
      <form
        action={crearResultado}
        className="px-4 pb-4 flex flex-col gap-3"
      >
        <input type="hidden" name="grupoId" value={grupoId} />

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.limaSoft }}>
            Partido
          </span>
          <select
            name="rotacion"
            required
            className="rounded-xl px-3 py-2 text-sm font-medium"
            style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
          >
            {rotaciones.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.limaSoft }}>
              Games pareja 1
            </span>
            <input
              type="number"
              name="gamesPareja1"
              min={0}
              required
              className="rounded-xl px-3 py-2 text-sm font-mono font-bold"
              style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.limaSoft }}>
              Games pareja 2
            </span>
            <input
              type="number"
              name="gamesPareja2"
              min={0}
              required
              className="rounded-xl px-3 py-2 text-sm font-mono font-bold"
              style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-xl py-2.5 text-sm font-black"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          Guardar resultado
        </button>
      </form>
    </details>
  );
}
