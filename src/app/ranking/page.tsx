import { Trophy } from "lucide-react";
import { COLORS } from "@/lib/colors";
import { calcularRanking } from "@/lib/data";

export default async function RankingPage() {
  const ranking = await calcularRanking();

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center gap-2 mb-1">
        <Trophy size={16} color={COLORS.lima} />
        <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
          Ranking general
        </h2>
      </div>
      <p className="text-xs mb-5" style={{ color: COLORS.limaSoft }}>
        Puntos = (games ganados − games perdidos) de todas las rondas + 2 pts de asistencia por jornada jugada.
      </p>

      <div className="space-y-1.5">
        {ranking.map((p, i) => {
          const pos = i + 1;
          const top3 = pos <= 3;
          return (
            <details
              key={p.nombre}
              className="rounded-xl overflow-hidden"
              style={{
                background: top3 ? COLORS.lima : COLORS.canchaAlt,
                border: `1px solid ${top3 ? COLORS.lima : COLORS.linea}`,
              }}
            >
              <summary className="w-full px-3.5 py-3 flex items-center gap-3 cursor-pointer list-none">
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
                  <p
                    className="text-[10px] leading-none mt-1"
                    style={{ color: top3 ? "#2A5651" : COLORS.limaSoft }}
                  >
                    {p.jornadasJugadas} jornadas
                  </p>
                </div>
              </summary>
              <div
                className="px-4 pb-3 pt-1 flex items-center justify-between text-xs"
                style={{ color: top3 ? "#2A5651" : COLORS.limaSoft }}
              >
                <span>
                  Games: {p.diffGames >= 0 ? "+" : ""}
                  {p.diffGames} ({p.rondas} rondas)
                </span>
                <span>Asistencia: +{p.asistencia}</span>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
