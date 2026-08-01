# Ligas de Padel

App de seguimiento de jornadas para una liga de pádel: grupos, resultados, ranking y rol de pelotas.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) + SQLite para persistencia
- Server Actions para todas las mutaciones (capturar resultados, asignar rol de pelotas)

## Empezar

```bash
npm install
npx prisma migrate dev   # crea prisma/migrations y la base local dev.db
npx prisma db seed       # carga datos de ejemplo (jugadores, jornadas, grupos, resultados)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Pantallas

- **Principal**: selector de jornada, grupos y resultados de cada ronda. Permite capturar un nuevo
  resultado por grupo (elige la rotación de parejas y el marcador).
- **Ranking**: puntos = diferencia de games acumulada + 2 pts de asistencia por jornada jugada.
- **Pelotas**: rol de quién lleva pelotas por jornada próxima, con sugerencia automática basada en
  quién ha llevado menos veces, e historial de jornadas ya jugadas.

## Modelo de datos

`prisma/schema.prisma` define: `Jugador`, `Jornada`, `JornadaParticipante` (asistencia confirmada),
`Grupo` / `GrupoJugador`, `Partido` / `PartidoJugador` (resultados) y `PelotasAsignacion`.
