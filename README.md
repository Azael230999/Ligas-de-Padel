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

## Modo solo lectura

Con la variable de entorno `READ_ONLY=true` la app oculta los formularios de edición (capturar
resultado, asignar rol de pelotas, usar sugerencia) y las server actions correspondientes rechazan
la mutación aunque se invoquen directamente. Útil para compartir un link de solo consulta.

## Desplegar un link de solo lectura (Firebase App Hosting)

El repo incluye `apphosting.yaml` para [Firebase App Hosting](https://firebase.google.com/docs/app-hosting),
que builda y sirve la app directo desde este repo de GitHub (sin necesidad de usar la terminal):

1. En la [consola de Firebase](https://console.firebase.google.com), crea o abre un proyecto.
2. Ve a **App Hosting** → **Crear backend**.
3. Conecta tu cuenta de GitHub y selecciona este repositorio y la rama a desplegar.
4. Firebase detecta que es Next.js y usa la configuración de `apphosting.yaml` (ya incluye
   `READ_ONLY=true` y una base SQLite efímera para esa instancia).
5. Al arrancar, el script `start` corre `prisma migrate deploy && prisma db seed` automáticamente,
   así que no hace falta preparar la base de datos a mano.
6. Firebase te da la URL pública (`https://<backend>--<proyecto>.web.app` o similar) — ese es el
   link que puedes compartir; siempre muestra los datos con los que se hizo el último deploy.

No se pudo probar un despliegue real en esta sesión (no había cuenta de Firebase conectada), así
que si algo en `apphosting.yaml` no coincide con la consola actual, ajústalo según lo que Firebase
te indique ahí.
