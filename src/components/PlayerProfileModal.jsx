import { X } from "lucide-react";
import { COLORS } from "../colors";
import { perfilJugador } from "../data";

export function PlayerProfileModal({ jornadas, nombre, stats, onClose }) {
  const historial = perfilJugador(jornadas, nombre);

  return (
    <div
      className="animar-fade fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="animar-hoja w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pt-5 pb-8"
        style={{ background: COLORS.cancha }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg" style={{ color: COLORS.crema }}>
            {nombre}
          </h3>
          <button onClick={onClose} title="Cerrar">
            <X size={20} color={COLORS.limaSoft} />
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="rounded-xl px-2 py-2.5 text-center" style={{ background: COLORS.canchaAlt }}>
              <p className="tabular font-black text-base" style={{ color: COLORS.lima }}>
                {stats.pts}
              </p>
              <p className="text-[10px] font-bold uppercase" style={{ color: COLORS.limaSoft }}>
                Puntos
              </p>
            </div>
            <div className="rounded-xl px-2 py-2.5 text-center" style={{ background: COLORS.canchaAlt }}>
              <p className="tabular font-black text-base" style={{ color: COLORS.crema }}>
                {stats.diffGames >= 0 ? "+" : ""}
                {stats.diffGames}
              </p>
              <p className="text-[10px] font-bold uppercase" style={{ color: COLORS.limaSoft }}>
                Games
              </p>
            </div>
            <div className="rounded-xl px-2 py-2.5 text-center" style={{ background: COLORS.canchaAlt }}>
              <p className="tabular font-black text-base" style={{ color: COLORS.crema }}>
                {stats.jornadasJugadas}
              </p>
              <p className="text-[10px] font-bold uppercase" style={{ color: COLORS.limaSoft }}>
                Jornadas
              </p>
            </div>
          </div>
        )}

        {stats && (stats.ajuste !== 0 || stats.penalizacionInactividad !== 0) && (
          <div className="flex items-center gap-3 text-xs mb-5 -mt-3" style={{ color: COLORS.limaSoft }}>
            {stats.ajuste !== 0 && (
              <span>
                Ajustes: {stats.ajuste >= 0 ? "+" : ""}
                {stats.ajuste}
              </span>
            )}
            {stats.penalizacionInactividad !== 0 && (
              <span>Penalización por inactividad: {stats.penalizacionInactividad}</span>
            )}
          </div>
        )}

        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.limaSoft }}>
          Historial
        </p>
        {historial.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.limaSoft }}>
            Todavía no tiene jornadas jugadas.
          </p>
        ) : (
          <div className="space-y-2">
            {historial.map((h) => (
              <div
                key={`${h.jornadaId}-${h.grupo}`}
                className="rounded-xl px-3.5 py-3"
                style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold" style={{ color: COLORS.lima }}>
                    {h.jornadaNombre} · {h.grupo}
                  </p>
                  {(h.esInvitado || !h.puntuable) && (
                    <span className="text-[10px] font-bold" style={{ color: COLORS.limaSoft }}>
                      {h.esInvitado ? "Invitado" : "No puntuable"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] mb-1.5" style={{ color: COLORS.limaSoft }}>
                  Con {h.companeros.join(", ") || "—"}
                </p>
                {h.partidos.length === 0 ? (
                  <p className="text-xs" style={{ color: COLORS.limaSoft }}>
                    Sin resultados capturados.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {h.partidos.map((p, i) => (
                      <p key={i} className="text-xs font-mono" style={{ color: COLORS.crema }}>
                        {p.pareja1.join("/")} vs {p.pareja2.join("/")} · {p.marcador}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
