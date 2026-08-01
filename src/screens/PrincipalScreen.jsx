import { useState } from "react";
import { Trophy, Users } from "lucide-react";
import { Chip } from "../components/Chip";
import { ResultadoForm } from "../components/ResultadoForm";
import { COLORS } from "../colors";
import { jornadasConGrupos, seedInitialData } from "../data";
import { pairingsDeCuatro, rotacionYaJugada } from "../pairings";

export function PrincipalScreen({ jornadas, admin }) {
  const conGrupos = jornadasConGrupos(jornadas);
  const [jornadaNombre, setJornadaNombre] = useState(null);
  const [sembrando, setSembrando] = useState(false);

  if (conGrupos.length === 0) {
    return (
      <div className="px-5 pt-6 pb-24">
        <p className="text-sm mb-4" style={{ color: COLORS.limaSoft }}>
          Todavía no hay jornadas con grupos armados.
        </p>
        {admin && (
          <button
            disabled={sembrando}
            onClick={async () => {
              setSembrando(true);
              await seedInitialData().catch(() => {});
              setSembrando(false);
            }}
            className="rounded-xl px-4 py-2.5 text-sm font-black"
            style={{ background: COLORS.lima, color: COLORS.tinta }}
          >
            {sembrando ? "Cargando…" : "Cargar datos de ejemplo"}
          </button>
        )}
      </div>
    );
  }

  const jornadaActual = conGrupos.find((j) => j.nombre === jornadaNombre) ?? conGrupos[0];
  const grupos = Object.entries(jornadaActual.grupos);

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: COLORS.lima }}>
          Viendo
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {conGrupos.map((j) => (
          <Chip key={j.nombre} active={jornadaActual.nombre === j.nombre} onClick={() => setJornadaNombre(j.nombre)}>
            {j.nombre}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Users size={16} color={COLORS.lima} />
        <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
          Grupos
        </h2>
      </div>

      <div className="space-y-2 mb-8">
        {grupos.map(([nombreGrupo, jugadores], i) => (
          <details
            key={nombreGrupo}
            open={i === 0}
            className="rounded-2xl overflow-hidden"
            style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
          >
            <summary className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer list-none">
              <span className="font-bold" style={{ color: COLORS.crema }}>
                {nombreGrupo}
              </span>
              <span className="text-xs" style={{ color: COLORS.limaSoft }}>
                {jugadores.length} jugadores
              </span>
            </summary>
            <div className="px-4 pb-3.5 flex flex-wrap gap-2">
              {jugadores.map((j) => (
                <span
                  key={j}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: COLORS.cancha, color: COLORS.crema }}
                >
                  {j}
                </span>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Trophy size={16} color={COLORS.lima} />
        <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
          Resultados
        </h2>
      </div>
      <div className="space-y-4">
        {grupos.map(([nombreGrupo, jugadores]) => {
          const rondas = (jornadaActual.resultados && jornadaActual.resultados[nombreGrupo]) || [];
          const rotaciones = pairingsDeCuatro(jugadores).filter((r) => !rotacionYaJugada(rondas, r));
          return (
            <div key={nombreGrupo} className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: COLORS.lima }}>
                {nombreGrupo}
              </p>
              {rondas.length === 0 ? (
                <p className="text-sm px-1" style={{ color: COLORS.limaSoft }}>
                  Sin resultados capturados todavía.
                </p>
              ) : (
                rondas.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                    style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
                  >
                    <div className="text-sm leading-snug" style={{ color: COLORS.crema }}>
                      <p>
                        <span className="font-bold">{r.pareja1.join(", ")}</span>
                      </p>
                      <p style={{ color: COLORS.limaSoft }}>vs</p>
                      <p>
                        <span className="font-bold">{r.pareja2.join(", ")}</span>
                      </p>
                    </div>
                    <span className="text-base font-black font-mono flex-shrink-0" style={{ color: COLORS.lima }}>
                      {r.marcador}
                    </span>
                  </div>
                ))
              )}
              {admin && (
                <ResultadoForm jornadaId={jornadaActual.id} grupoNombre={nombreGrupo} rotaciones={rotaciones} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
