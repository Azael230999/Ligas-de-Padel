import { useState } from "react";
import { Trophy, Users } from "lucide-react";
import { Chip } from "../components/Chip";
import { EmptyState } from "../components/EmptyState";
import { ResultadoForm } from "../components/ResultadoForm";
import { ResultadoRow } from "../components/ResultadoRow";
import { COLORS } from "../colors";
import { jornadasConGrupos, seedInitialData } from "../data";
import { pairingsDeCuatro, rotacionYaJugada } from "../pairings";
import { useToast } from "../toast";

export function PrincipalScreen({ jornadas, admin }) {
  const conGrupos = jornadasConGrupos(jornadas);
  const [jornadaNombre, setJornadaNombre] = useState(null);
  const [sembrando, setSembrando] = useState(false);
  const showToast = useToast();

  if (conGrupos.length === 0) {
    return (
      <div className="px-5 pt-6 pb-24">
        <EmptyState
          mensaje={
            admin
              ? "Todavía no hay jornadas con grupos armados. Créalas desde la pestaña Admin, o carga datos de ejemplo para explorar la app."
              : "Todavía no hay jornadas con grupos armados."
          }
        >
          {admin && (
            <button
              disabled={sembrando}
              onClick={async () => {
                setSembrando(true);
                try {
                  await seedInitialData();
                  showToast("Datos de ejemplo cargados ✓");
                } catch (err) {
                  showToast("No se pudieron cargar los datos de ejemplo.", "error");
                }
                setSembrando(false);
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-black"
              style={{ background: COLORS.lima, color: COLORS.tinta }}
            >
              {sembrando ? "Cargando…" : "Cargar datos de ejemplo"}
            </button>
          )}
        </EmptyState>
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
                  <ResultadoRow
                    key={i}
                    jornadaId={jornadaActual.id}
                    grupoNombre={nombreGrupo}
                    resultado={r}
                    index={i}
                    resultadosActuales={rondas}
                    admin={admin}
                  />
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
