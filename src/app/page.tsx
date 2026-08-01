import { Trophy, Users } from "lucide-react";
import { seedInitialData } from "@/app/actions";
import { Chip } from "@/components/Chip";
import { ResultadoForm } from "@/components/ResultadoForm";
import { COLORS } from "@/lib/colors";
import { getGruposDeJornada, getJornadasConGrupos } from "@/lib/data";
import { pairingsDeCuatro, rotacionYaJugada } from "@/lib/pairings";
import { isAdmin } from "@/lib/auth";

export default async function PrincipalPage({
  searchParams,
}: {
  searchParams: Promise<{ jornada?: string }>;
}) {
  const { jornada: jornadaParam } = await searchParams;
  const [jornadas, admin] = await Promise.all([getJornadasConGrupos(), isAdmin()]);
  if (jornadas.length === 0) {
    return (
      <div className="px-5 pt-6 pb-24">
        <p className="text-sm mb-4" style={{ color: COLORS.limaSoft }}>
          Todavía no hay jornadas con grupos armados.
        </p>
        {admin && (
          <form action={seedInitialData}>
            <button
              type="submit"
              className="rounded-xl px-4 py-2.5 text-sm font-black"
              style={{ background: COLORS.lima, color: COLORS.tinta }}
            >
              Cargar datos de ejemplo
            </button>
          </form>
        )}
      </div>
    );
  }

  const jornadaActual = jornadas.find((j) => j.nombre === jornadaParam) ?? jornadas[0];
  const grupos = await getGruposDeJornada(jornadaActual.id);

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: COLORS.lima }}>
          Viendo
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {jornadas.map((j) => (
          <Chip key={j.nombre} active={jornadaActual.nombre === j.nombre} href={`/?jornada=${encodeURIComponent(j.nombre)}`}>
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
        {grupos.map((grupo, i) => (
          <details
            key={grupo.id}
            open={i === 0}
            className="rounded-2xl overflow-hidden"
            style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
          >
            <summary className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer list-none">
              <span className="font-bold" style={{ color: COLORS.crema }}>
                {grupo.nombre}
              </span>
              <span className="text-xs" style={{ color: COLORS.limaSoft }}>
                {grupo.jugadores.length} jugadores
              </span>
            </summary>
            <div className="px-4 pb-3.5 flex flex-wrap gap-2">
              {grupo.jugadores.map((j) => (
                <span
                  key={j.id}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: COLORS.cancha, color: COLORS.crema }}
                >
                  {j.nombre}
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
        {grupos.map((grupo) => {
          const rotaciones = pairingsDeCuatro(grupo.jugadores).filter(
            (r) => !rotacionYaJugada(grupo.partidos, r)
          );
          return (
            <div key={grupo.id} className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: COLORS.lima }}>
                {grupo.nombre}
              </p>
              {grupo.partidos.length === 0 ? (
                <p className="text-sm px-1" style={{ color: COLORS.limaSoft }}>
                  Sin resultados capturados todavía.
                </p>
              ) : (
                grupo.partidos.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                    style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
                  >
                    <div className="text-sm leading-snug" style={{ color: COLORS.crema }}>
                      <p>
                        <span className="font-bold">{r.pareja1.map((p) => p.nombre).join(", ")}</span>
                      </p>
                      <p style={{ color: COLORS.limaSoft }}>vs</p>
                      <p>
                        <span className="font-bold">{r.pareja2.map((p) => p.nombre).join(", ")}</span>
                      </p>
                    </div>
                    <span className="text-base font-black font-mono flex-shrink-0" style={{ color: COLORS.lima }}>
                      {r.gamesPareja1}/{r.gamesPareja2}
                    </span>
                  </div>
                ))
              )}
              <ResultadoForm grupoId={grupo.id} rotaciones={rotaciones} admin={admin} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
