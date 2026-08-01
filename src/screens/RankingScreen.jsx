import { useState } from "react";
import { Trophy } from "lucide-react";
import { Chip } from "../components/Chip";
import { EmptyState } from "../components/EmptyState";
import { PlayerProfileModal } from "../components/PlayerProfileModal";
import { COLORS } from "../colors";
import { calcularRanking, jornadasConGrupos } from "../data";

export function RankingScreen({ jornadas, ajustes = [] }) {
  const temporadas = [...new Set(jornadas.filter((j) => j.temporada).map((j) => j.temporada))];
  const [temporadaFiltro, setTemporadaFiltro] = useState("todas");
  const [jornadaFiltro, setJornadaFiltro] = useState("todas");
  const [abierto, setAbierto] = useState(null);
  const [perfil, setPerfil] = useState(null);

  const jornadasDeTemporada =
    temporadaFiltro === "todas" ? jornadas : jornadas.filter((j) => j.temporada === temporadaFiltro);
  const conGrupos = jornadasConGrupos(jornadasDeTemporada);

  const jornadasParaRanking = jornadaFiltro === "todas" ? jornadasDeTemporada : conGrupos.filter((j) => j.id === jornadaFiltro);
  const ranking = calcularRanking(jornadasParaRanking, ajustes);

  const cambiarTemporada = (t) => {
    setTemporadaFiltro(t);
    setJornadaFiltro("todas");
  };

  // Aviso informativo de posible descenso: solo tiene sentido viendo la
  // tabla completa de una temporada específica (no "Todas" ni una sola
  // jornada). No mueve a nadie de liga automáticamente, eso es decisión
  // del club.
  const posibleDescenso =
    temporadaFiltro !== "todas" && jornadaFiltro === "todas" && ranking.length >= 2
      ? ranking[ranking.length - 2].pts - ranking[ranking.length - 1].pts >= 15
      : false;

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center gap-2 mb-1">
        <Trophy size={16} color={COLORS.lima} />
        <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
          Ranking general
        </h2>
      </div>
      <p className="text-xs mb-4" style={{ color: COLORS.limaSoft }}>
        Puntos = (games ganados − games perdidos) de todas las rondas + 2 pts de asistencia por jornada jugada.
      </p>

      {temporadas.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          <Chip active={temporadaFiltro === "todas"} onClick={() => cambiarTemporada("todas")}>
            Todas las temporadas
          </Chip>
          {temporadas.map((t) => (
            <Chip key={t} active={temporadaFiltro === t} onClick={() => cambiarTemporada(t)}>
              {t}
            </Chip>
          ))}
        </div>
      )}

      {conGrupos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          <Chip active={jornadaFiltro === "todas"} onClick={() => setJornadaFiltro("todas")}>
            Todas
          </Chip>
          {conGrupos.map((j) => (
            <Chip key={j.id} active={jornadaFiltro === j.id} onClick={() => setJornadaFiltro(j.id)}>
              {j.nombre}
            </Chip>
          ))}
        </div>
      )}

      {posibleDescenso && (
        <p className="text-xs font-bold mb-3 px-1" style={{ color: "#F5716B" }}>
          El último lugar tiene un diferencial de 15 pts o más con el penúltimo — posible descenso a 2da fuerza.
        </p>
      )}

      {ranking.length === 0 && (
        <EmptyState mensaje="Todavía no hay resultados capturados para armar un ranking." />
      )}

      <div className="space-y-1.5">
        {ranking.map((p, i) => {
          const pos = i + 1;
          const top3 = pos <= 3;
          const abiertoAqui = abierto === p.nombre;
          return (
            <div
              key={p.nombre}
              className="rounded-xl overflow-hidden"
              style={{
                background: top3 ? COLORS.lima : COLORS.canchaAlt,
                border: `1px solid ${top3 ? COLORS.lima : COLORS.linea}`,
              }}
            >
              <button
                className="w-full px-3.5 py-3 flex items-center gap-3"
                onClick={() => setAbierto(abiertoAqui ? null : p.nombre)}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{
                    background: top3 ? COLORS.tinta : COLORS.lima,
                    color: top3 ? COLORS.lima : COLORS.tinta,
                  }}
                >
                  {pos}
                </span>
                <span className="font-bold flex-1 text-left" style={{ color: top3 ? COLORS.tinta : COLORS.crema }}>
                  {p.nombre}
                </span>
                <div className="text-right">
                  <p className="font-black text-sm leading-none" style={{ color: top3 ? COLORS.tinta : COLORS.crema }}>
                    {p.pts} pts
                  </p>
                  <p className="text-[10px] leading-none mt-1" style={{ color: top3 ? "#2A5651" : COLORS.limaSoft }}>
                    {p.jornadasJugadas} jornadas
                  </p>
                </div>
              </button>
              {abiertoAqui && (
                <div className="px-4 pb-3 pt-1" style={{ color: top3 ? "#2A5651" : COLORS.limaSoft }}>
                  <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                    <span>
                      Games: {p.diffGames >= 0 ? "+" : ""}
                      {p.diffGames} ({p.rondas} rondas)
                    </span>
                    <span>Asistencia: +{p.asistencia}</span>
                    {p.ajuste !== 0 && (
                      <span>
                        Ajustes: {p.ajuste >= 0 ? "+" : ""}
                        {p.ajuste}
                      </span>
                    )}
                    {p.penalizacionInactividad !== 0 && <span>Inactividad: {p.penalizacionInactividad}</span>}
                    <button className="font-bold underline" onClick={() => setPerfil(p)}>
                      Ver perfil
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {perfil && (
        <PlayerProfileModal jornadas={jornadas} nombre={perfil.nombre} stats={perfil} onClose={() => setPerfil(null)} />
      )}
    </div>
  );
}
