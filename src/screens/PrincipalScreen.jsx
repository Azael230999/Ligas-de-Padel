import { useState } from "react";
import { Trophy, Users } from "lucide-react";
import { Chip } from "../components/Chip";
import { EmptyState } from "../components/EmptyState";
import { PelotaIcon } from "../components/PelotaIcon";
import { ResultadoForm } from "../components/ResultadoForm";
import { ResultadoRow } from "../components/ResultadoRow";
import { COLORS } from "../colors";
import { jornadasConGrupos, seedInitialData } from "../data";
import { pairingsDeCuatro } from "../pairings";
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

  // La más reciente (última en orden), para que la app abra directo en la
  // próxima jornada en vez de en la más vieja de la lista.
  const masReciente = conGrupos[conGrupos.length - 1];
  const jornadaActual = conGrupos.find((j) => j.nombre === jornadaNombre) ?? masReciente;
  const grupos = Object.entries(jornadaActual.grupos);

  // Para cada cancha de esta jornada, quién (si alguien) tiene asignado el
  // rol de pelotas — cruzando pelotasAsignados contra los jugadores de cada
  // grupo, ya que la asignación no guarda la cancha directamente.
  const pelotasPorCancha = grupos
    .map(([nombreCancha, jugadores]) => ({
      nombreCancha,
      asignado: (jornadaActual.pelotasAsignados || []).find((p) => jugadores.includes(p)),
    }))
    .filter((c) => c.asignado);

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: COLORS.lima }}>
          Viendo
        </span>
      </div>
      <div className="chip-scroll flex gap-2 overflow-x-auto pb-5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {conGrupos.map((j) => (
          <Chip
            key={j.nombre}
            active={jornadaActual.nombre === j.nombre}
            onClick={() => setJornadaNombre(j.nombre)}
            badge={j.nombre === masReciente.nombre ? "Próxima" : null}
          >
            {j.nombre}
          </Chip>
        ))}
      </div>

      {pelotasPorCancha.length > 0 && (
        <div
          className="rounded-2xl px-3.5 py-3 mb-5"
          style={{
            background: "linear-gradient(160deg, rgba(212,245,71,0.14), rgba(212,245,71,0.05))",
            border: "1.3px solid rgba(212,245,71,0.35)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <PelotaIcon size={17} />
            <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: COLORS.lima }}>
              Rol de pelotas · esta jornada
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pelotasPorCancha.map(({ nombreCancha, asignado }) => (
              <span
                key={nombreCancha}
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: COLORS.tinta, color: COLORS.crema }}
              >
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{ background: COLORS.lima, color: COLORS.tinta }}
                >
                  {nombreCancha}
                </span>
                {asignado}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Users size={16} color={COLORS.lima} />
        <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
          Grupos
        </h2>
      </div>

      <div className="space-y-2 mb-8 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
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
          const rotaciones = pairingsDeCuatro(jugadores);
          return (
            <div key={nombreGrupo} className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: COLORS.lima }}>
                {nombreGrupo}
              </p>
              {rondas.length === 0 ? (
                <p className="flex items-center gap-1.5 text-sm px-1" style={{ color: COLORS.limaSoft }}>
                  <PelotaIcon size={14} />
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
                <ResultadoForm
                  jornadaId={jornadaActual.id}
                  grupoNombre={nombreGrupo}
                  rotaciones={rotaciones}
                  rondas={rondas}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
