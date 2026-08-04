import { useState } from "react";
import { Check, CircleDot } from "lucide-react";
import { Desplegable } from "../components/Desplegable";
import { EmptyState } from "../components/EmptyState";
import { COLORS } from "../colors";
import {
  aplicarSugerenciaPelotas,
  calcularBalancePelotas,
  jornadasHistorialPelotas,
  jornadasPelotasPendientes,
  sugerirAsignados,
  toggleAsignacionPelotas,
} from "../data";
import { useToast } from "../toast";

export function PelotasScreen({ jornadas, admin }) {
  const asignables = jornadasPelotasPendientes(jornadas);
  const historial = jornadasHistorialPelotas(jornadas);
  const { conteo, jugadas } = calcularBalancePelotas(jornadas);
  const [jornadaNombre, setJornadaNombre] = useState(null);
  const showToast = useToast();

  // La más reciente (última en orden), para no caer en la más vieja de la
  // lista por default — mismo fix que ya se hizo en Principal/Ranking.
  const masReciente = asignables[asignables.length - 1];
  const jornadaActual = asignables.find((j) => j.nombre === jornadaNombre) ?? masReciente;
  const asignados = new Set(jornadaActual?.pelotasAsignados || []);

  const balanceOrdenado = Object.keys(jugadas).sort((a, b) => {
    const ratioA = (conteo[a] || 0) / jugadas[a];
    const ratioB = (conteo[b] || 0) / jugadas[b];
    return ratioA - ratioB;
  });

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center gap-2 mb-1">
        <CircleDot size={16} color={COLORS.lima} />
        <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
          Rol de pelotas
        </h2>
      </div>
      <p className="text-xs mb-5" style={{ color: COLORS.limaSoft }}>
        Una persona por cancha en juego. Se sugiere a quien menos ha llevado, entre quienes sí participan esa
        jornada.
      </p>

      {!jornadaActual ? (
        <EmptyState mensaje="No hay jornadas con participantes confirmados todavía." />
      ) : (
        <>
          <Desplegable
            eyebrow="Viendo"
            valorLabel={jornadaActual.nombre}
            esActualValor={jornadaActual.nombre === masReciente.nombre}
            opciones={[...asignables].reverse().map((j) => {
              const resuelto = (j.pelotasAsignados || []).length >= j.canchas;
              return {
                id: j.nombre,
                label: `${j.nombre}${resuelto ? " ✓" : ""}`,
                actual: j.nombre === masReciente.nombre,
                seleccionado: j.nombre === jornadaActual.nombre,
              };
            })}
            onSeleccionar={setJornadaNombre}
          />

          <div
            className="rounded-2xl px-4 py-3 mb-3 flex items-center justify-between"
            style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
          >
            <span className="text-sm font-bold" style={{ color: COLORS.crema }}>
              {jornadaActual.canchas} {jornadaActual.canchas === 1 ? "cancha" : "canchas"} en juego
            </span>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{
                background: asignados.size === jornadaActual.canchas ? COLORS.lima : COLORS.cancha,
                color: asignados.size === jornadaActual.canchas ? COLORS.tinta : COLORS.limaSoft,
              }}
            >
              {asignados.size}/{jornadaActual.canchas} asignados
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.limaSoft }}>
              Participantes de esta jornada
            </p>
            {admin && (
              <button
                className="text-[11px] font-bold underline"
                style={{ color: COLORS.lima }}
                onClick={() => {
                  const sugeridos = sugerirAsignados(jornadaActual.participantes, jornadaActual.canchas, conteo);
                  aplicarSugerenciaPelotas(jornadaActual.id, sugeridos)
                    .then(() => showToast("Sugerencia aplicada ✓"))
                    .catch(() => showToast("No se pudo aplicar la sugerencia.", "error"));
                }}
              >
                Usar sugerencia
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {jornadaActual.participantes.map((p) => {
              const asignado = asignados.has(p);
              const veces = conteo[p] || 0;
              const chipStyle = {
                background: asignado ? COLORS.lima : COLORS.canchaAlt,
                border: `1px solid ${asignado ? COLORS.lima : COLORS.linea}`,
              };
              const chipContent = (
                <>
                  <span className="text-sm font-bold" style={{ color: asignado ? COLORS.tinta : COLORS.crema }}>
                    {p}
                  </span>
                  <span className="tabular text-[10px] font-bold" style={{ color: asignado ? "#2A5651" : COLORS.limaSoft }}>
                    ·{veces}
                  </span>
                  {asignado && <Check size={13} color={COLORS.tinta} />}
                </>
              );

              if (!admin) {
                return (
                  <div key={p} className="px-3 py-2 rounded-xl flex items-center gap-1.5" style={chipStyle}>
                    {chipContent}
                  </div>
                );
              }

              const handleToggle = () => {
                if (asignado && !confirm(`¿Quitar a "${p}" del rol de pelotas de esta jornada?`)) return;
                toggleAsignacionPelotas(jornadaActual.id, p, asignado)
                  .then(() => showToast(asignado ? "Quitado ✓" : "Asignado ✓"))
                  .catch(() => showToast("No se pudo actualizar.", "error"));
              };

              return (
                <button
                  key={p}
                  className="px-3 py-2 rounded-xl flex items-center gap-1.5"
                  style={chipStyle}
                  onClick={handleToggle}
                >
                  {chipContent}
                </button>
              );
            })}
          </div>
        </>
      )}

      <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.limaSoft }}>
        Ya jugadas
      </p>
      <div className="space-y-1.5 mb-6">
        {historial.map((h) => (
          <div key={h.id} className="rounded-xl px-4 py-2.5" style={{ opacity: 0.6, border: `1px solid ${COLORS.linea}` }}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.lima }}>
              {h.nombre} · {h.canchas} {h.canchas === 1 ? "cancha" : "canchas"}
            </p>
            <p className="font-bold text-sm" style={{ color: COLORS.crema }}>
              {(h.pelotasAsignados || []).length > 0 ? h.pelotasAsignados.join(", ") : "Sin asignar todavía"}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.limaSoft }}>
        Balance (veces que ha llevado / jornadas jugadas)
      </p>
      <div className="space-y-1.5">
        {balanceOrdenado.map((p) => (
          <div key={p} className="flex items-center justify-between px-1">
            <span className="text-sm font-medium" style={{ color: COLORS.crema }}>
              {p}
            </span>
            <span className="tabular text-xs" style={{ color: COLORS.limaSoft }}>
              {conteo[p] || 0} / {jugadas[p]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
