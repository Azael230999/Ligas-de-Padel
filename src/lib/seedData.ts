import type { PrismaClient } from "@/generated/prisma/client";

const JUGADORES = [
  "Fulanito",
  "Juan",
  "Jorge",
  "Ricardo",
  "Pedro",
  "Luis",
  "Marco",
  "Sofía",
  "Ana",
  "Diego",
  "Karla",
  "Tomás",
];

type Partido = {
  pareja1: [string, string];
  pareja2: [string, string];
  gamesPareja1: number;
  gamesPareja2: number;
};

type Grupo = {
  nombre: string;
  jugadores: string[];
  partidos: Partido[];
};

type Jornada = {
  nombre: string;
  orden: number;
  canchas: number;
  grupos?: Grupo[];
  // Participantes confirmados cuando aún no hay grupos armados.
  participantes?: string[];
  pelotasAsignados?: string[];
};

const JORNADAS: Jornada[] = [
  {
    nombre: "Jornada 1",
    orden: 1,
    canchas: 3,
    pelotasAsignados: ["Fulanito", "Juan", "Jorge"],
    grupos: [
      {
        nombre: "Grupo 1",
        jugadores: ["Fulanito", "Juan", "Jorge", "Ricardo"],
        partidos: [
          { pareja1: ["Fulanito", "Ricardo"], pareja2: ["Juan", "Jorge"], gamesPareja1: 6, gamesPareja2: 4 },
          { pareja1: ["Juan", "Fulanito"], pareja2: ["Jorge", "Ricardo"], gamesPareja1: 2, gamesPareja2: 6 },
          { pareja1: ["Fulanito", "Jorge"], pareja2: ["Ricardo", "Juan"], gamesPareja1: 3, gamesPareja2: 6 },
        ],
      },
      {
        nombre: "Grupo 2",
        jugadores: ["Pedro", "Luis", "Marco", "Sofía"],
        partidos: [
          { pareja1: ["Pedro", "Marco"], pareja2: ["Luis", "Sofía"], gamesPareja1: 6, gamesPareja2: 3 },
          { pareja1: ["Luis", "Pedro"], pareja2: ["Sofía", "Marco"], gamesPareja1: 5, gamesPareja2: 7 },
          { pareja1: ["Pedro", "Sofía"], pareja2: ["Marco", "Luis"], gamesPareja1: 6, gamesPareja2: 2 },
        ],
      },
      {
        nombre: "Grupo 3",
        jugadores: ["Ana", "Diego", "Karla", "Tomás"],
        partidos: [],
      },
    ],
  },
  {
    nombre: "Jornada 2",
    orden: 2,
    canchas: 3,
    pelotasAsignados: ["Ricardo", "Pedro", "Sofía"],
    grupos: [
      {
        nombre: "Grupo 1",
        jugadores: ["Fulanito", "Sofía", "Jorge", "Ana"],
        partidos: [
          { pareja1: ["Fulanito", "Sofía"], pareja2: ["Jorge", "Ana"], gamesPareja1: 6, gamesPareja2: 4 },
          { pareja1: ["Jorge", "Fulanito"], pareja2: ["Ana", "Sofía"], gamesPareja1: 6, gamesPareja2: 1 },
        ],
      },
      {
        nombre: "Grupo 2",
        jugadores: ["Pedro", "Juan", "Marco", "Diego"],
        partidos: [
          { pareja1: ["Pedro", "Juan"], pareja2: ["Marco", "Diego"], gamesPareja1: 7, gamesPareja2: 5 },
        ],
      },
      {
        nombre: "Grupo 3",
        jugadores: ["Ricardo", "Luis", "Karla", "Tomás"],
        partidos: [],
      },
    ],
  },
  {
    nombre: "Jornada 3",
    orden: 3,
    canchas: 3,
    pelotasAsignados: ["Ana"],
    grupos: [
      { nombre: "Grupo 1", jugadores: ["Marco", "Juan", "Ana", "Ricardo"], partidos: [] },
      { nombre: "Grupo 2", jugadores: ["Pedro", "Sofía", "Jorge", "Tomás"], partidos: [] },
      { nombre: "Grupo 3", jugadores: ["Fulanito", "Luis", "Karla", "Diego"], partidos: [] },
    ],
  },
  {
    nombre: "Jornada 4",
    orden: 4,
    canchas: 3,
    participantes: ["Fulanito", "Juan", "Jorge", "Ricardo", "Pedro", "Sofía"],
  },
  {
    nombre: "Jornada 5",
    orden: 5,
    canchas: 1,
    participantes: ["Ana", "Sofía", "Pedro"],
  },
];

export async function runSeed(prisma: PrismaClient) {
  const jugadorPorNombre = new Map<string, number>();
  for (const nombre of JUGADORES) {
    const jugador = await prisma.jugador.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    jugadorPorNombre.set(nombre, jugador.id);
  }
  const idDe = (nombre: string) => {
    const id = jugadorPorNombre.get(nombre);
    if (!id) throw new Error(`Jugador desconocido en seed: ${nombre}`);
    return id;
  };

  for (const j of JORNADAS) {
    const jornada = await prisma.jornada.upsert({
      where: { nombre: j.nombre },
      update: { orden: j.orden, canchas: j.canchas },
      create: { nombre: j.nombre, orden: j.orden, canchas: j.canchas },
    });

    const participantesConfirmados = new Set<string>(j.participantes ?? []);
    for (const g of j.grupos ?? []) {
      for (const jugador of g.jugadores) participantesConfirmados.add(jugador);
    }
    for (const nombre of participantesConfirmados) {
      await prisma.jornadaParticipante.upsert({
        where: { jornadaId_jugadorId: { jornadaId: jornada.id, jugadorId: idDe(nombre) } },
        update: {},
        create: { jornadaId: jornada.id, jugadorId: idDe(nombre) },
      });
    }

    for (const g of j.grupos ?? []) {
      const grupo = await prisma.grupo.upsert({
        where: { jornadaId_nombre: { jornadaId: jornada.id, nombre: g.nombre } },
        update: {},
        create: { jornadaId: jornada.id, nombre: g.nombre },
      });

      for (const nombre of g.jugadores) {
        await prisma.grupoJugador.upsert({
          where: { grupoId_jugadorId: { grupoId: grupo.id, jugadorId: idDe(nombre) } },
          update: {},
          create: { grupoId: grupo.id, jugadorId: idDe(nombre) },
        });
      }

      for (const partido of g.partidos) {
        const existente = await prisma.partido.findFirst({
          where: {
            grupoId: grupo.id,
            gamesPareja1: partido.gamesPareja1,
            gamesPareja2: partido.gamesPareja2,
            jugadores: { some: { jugadorId: idDe(partido.pareja1[0]) } },
          },
        });
        if (existente) continue;

        await prisma.partido.create({
          data: {
            grupoId: grupo.id,
            gamesPareja1: partido.gamesPareja1,
            gamesPareja2: partido.gamesPareja2,
            jugadores: {
              create: [
                { jugadorId: idDe(partido.pareja1[0]), pareja: 1 },
                { jugadorId: idDe(partido.pareja1[1]), pareja: 1 },
                { jugadorId: idDe(partido.pareja2[0]), pareja: 2 },
                { jugadorId: idDe(partido.pareja2[1]), pareja: 2 },
              ],
            },
          },
        });
      }
    }

    for (const nombre of j.pelotasAsignados ?? []) {
      await prisma.pelotasAsignacion.upsert({
        where: { jornadaId_jugadorId: { jornadaId: jornada.id, jugadorId: idDe(nombre) } },
        update: {},
        create: { jornadaId: jornada.id, jugadorId: idDe(nombre) },
      });
    }
  }
}
