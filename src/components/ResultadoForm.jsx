import { useState } from "react";
import { COLORS } from "../colors";
import { crearResultado } from "../data";
import { rotacionYaJugada } from "../pairings";
import { useToast } from "../toast";

// Se muestran todas las rotaciones posibles, no solo las que faltan por
// jugar: así se puede capturar una revancha de un partido que ya se jugó,
// en vez de que el formulario desaparezca cuando ya se jugaron las 3.
export function ResultadoForm({ jornadaId, grupoNombre, rotaciones, rondas = [] }) {
  const [abierto, setAbierto] = useState(false);
  const primeraSinJugar = rotaciones.find((r) => !rotacionYaJugada(rondas, r));
  const [rotacion, setRotacion] = useState((primeraSinJugar ?? rotaciones[0])?.value ?? "");
  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const showToast = useToast();

  if (rotaciones.length === 0) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const elegida = rotaciones.find((r) => r.value === rotacion);
    if (!elegida || g1 === "" || g2 === "") return;
    setGuardando(true);
    setError("");
    try {
      await crearResultado(jornadaId, grupoNombre, {
        pareja1: elegida.pareja1,
        pareja2: elegida.pareja2,
        marcador: `${g1}/${g2}`,
      });
      setG1("");
      setG2("");
      setAbierto(false);
      showToast("Resultado guardado ✓");
    } catch (err) {
      setError("No se pudo guardar. ¿Iniciaste sesión como admin?");
      showToast("No se pudo guardar el resultado.", "error");
    }
    setGuardando(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px dashed ${COLORS.linea}` }}>
      <button
        className="w-full text-left px-4 py-3 text-sm font-bold"
        style={{ color: COLORS.lima }}
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? "▾" : "▸"} + Agregar resultado
      </button>
      {abierto && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.limaSoft }}>
              Partido
            </span>
            <select
              value={rotacion}
              onChange={(e) => setRotacion(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm font-medium"
              style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
            >
              {rotaciones.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                  {rotacionYaJugada(rondas, r) ? " (ya jugado, capturar revancha)" : ""}
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
                min={0}
                required
                value={g1}
                onChange={(e) => setG1(e.target.value)}
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
                min={0}
                required
                value={g2}
                onChange={(e) => setG2(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm font-mono font-bold"
                style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
              />
            </label>
          </div>

          {error && (
            <p className="text-xs font-bold" style={{ color: "#F5716B" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="rounded-xl py-2.5 text-sm font-black"
            style={{ background: COLORS.lima, color: COLORS.tinta }}
          >
            {guardando ? "Guardando…" : "Guardar resultado"}
          </button>
        </form>
      )}
    </div>
  );
}
