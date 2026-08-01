import { prisma } from "@/lib/prisma";

export async function getJornadasConGrupos() {
  return prisma.jornada.findMany({
    where: { grupos: { some: {} } },
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, orden: true, canchas: true },
  });
}

export async function getGruposDeJornada(jornadaId: number) {
  const grupos = await prisma.grupo.findMany({
    where: { jornadaId },
    orderBy: { nombre: "asc" },
    include: {
      jugadores: { include: { jugador: true }, orderBy: { jugador: { nombre: "asc" } } },
      partidos: { include: { jugadores: { include: { jugador: true } } } },
    },
  });

  return grupos.map((g) => ({
    id: g.id,
    nombre: g.nombre,
    jugadores: g.jugadores.map((gj) => gj.jugador),
    partidos: g.partidos.map((p) => {
      const pareja1 = p.jugadores.filter((pj) => pj.pareja === 1).map((pj) => pj.jugador);
      const pareja2 = p.jugadores.filter((pj) => pj.pareja === 2).map((pj) => pj.jugador);
      return {
        id: p.id,
        pareja1,
        pareja2,
        gamesPareja1: p.gamesPareja1,
        gamesPareja2: p.gamesPareja2,
      };
    }),
  }));
}

export type RankingEntry = {
  nombre: string;
  diffGames: number;
  asistencia: number;
  rondas: number;
  jornadasJugadas: number;
  pts: number;
};

export async function calcularRanking(): Promise<RankingEntry[]> {
  const stats = new Map<string, { diffGames: number; jornadas: Set<number>; rondas: number }>();
  const asegurar = (nombre: string) => {
    if (!stats.has(nombre)) stats.set(nombre, { diffGames: 0, jornadas: new Set(), rondas: 0 });
    return stats.get(nombre)!;
  };

  const participaciones = await prisma.jornadaParticipante.findMany({
    where: { jornada: { grupos: { some: {} } } },
    include: { jugador: true },
  });
  for (const p of participaciones) {
    asegurar(p.jugador.nombre).jornadas.add(p.jornadaId);
  }

  const partidos = await prisma.partido.findMany({
    include: { jugadores: { include: { jugador: true } } },
  });
  for (const partido of partidos) {
    const pareja1 = partido.jugadores.filter((pj) => pj.pareja === 1);
    const pareja2 = partido.jugadores.filter((pj) => pj.pareja === 2);
    const diff = partido.gamesPareja1 - partido.gamesPareja2;
    for (const pj of pareja1) {
      const s = asegurar(pj.jugador.nombre);
      s.diffGames += diff;
      s.rondas += 1;
    }
    for (const pj of pareja2) {
      const s = asegurar(pj.jugador.nombre);
      s.diffGames -= diff;
      s.rondas += 1;
    }
  }

  return Array.from(stats.entries())
    .map(([nombre, s]) => {
      const asistencia = s.jornadas.size * 2;
      return {
        nombre,
        diffGames: s.diffGames,
        asistencia,
        rondas: s.rondas,
        jornadasJugadas: s.jornadas.size,
        pts: s.diffGames + asistencia,
      };
    })
    .sort((a, b) => b.pts - a.pts);
}

export async function getJornadasHistorialPelotas() {
  const jornadas = await prisma.jornada.findMany({
    where: { grupos: { some: {} } },
    orderBy: { orden: "asc" },
    include: { pelotas: { include: { jugador: true } } },
  });
  return jornadas.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    canchas: j.canchas,
    asignados: j.pelotas.map((p) => p.jugador.nombre),
  }));
}

export async function getJornadasProximasPelotas() {
  const jornadas = await prisma.jornada.findMany({
    where: { grupos: { none: {} }, participantes: { some: {} } },
    orderBy: { orden: "asc" },
    include: { participantes: { include: { jugador: true } }, pelotas: true },
  });
  return jornadas.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    canchas: j.canchas,
    participantes: j.participantes.map((p) => p.jugador),
    asignadosIds: new Set(j.pelotas.map((p) => p.jugadorId)),
  }));
}

export async function calcularBalancePelotas() {
  const historial = await getJornadasHistorialPelotas();
  const historialIds = new Set(historial.map((j) => j.id));

  const conteo: Record<string, number> = {};
  for (const j of historial) {
    for (const nombre of j.asignados) conteo[nombre] = (conteo[nombre] ?? 0) + 1;
  }

  const participaciones = await prisma.jornadaParticipante.findMany({
    where: { jornadaId: { in: Array.from(historialIds) } },
    include: { jugador: true },
  });
  const jugadas: Record<string, number> = {};
  for (const p of participaciones) {
    jugadas[p.jugador.nombre] = (jugadas[p.jugador.nombre] ?? 0) + 1;
  }

  return { conteo, jugadas };
}

export function sugerirAsignados(
  participantes: { id: number; nombre: string }[],
  canchas: number,
  conteo: Record<string, number>
) {
  const orden = [...participantes].sort((a, b) => {
    const diff = (conteo[a.nombre] ?? 0) - (conteo[b.nombre] ?? 0);
    return diff !== 0 ? diff : a.nombre.localeCompare(b.nombre);
  });
  return orden.slice(0, canchas);
}
