# Ligas de Padel

App de seguimiento de jornadas para una liga de pádel: grupos, resultados, ranking y rol de pelotas.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) + PostgreSQL para persistencia
- Server Actions para todas las mutaciones (capturar resultados, asignar rol de pelotas)

## Empezar

Necesitas una base PostgreSQL corriendo localmente (o apuntar `DATABASE_URL` a una remota).

```bash
npm install
npx prisma migrate dev   # crea prisma/migrations y aplica el esquema
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), entra a `/login` con la contraseña de
`ADMIN_PASSWORD` (variable de entorno, ver `.env`) y usa el botón **"Cargar datos de ejemplo"**
que aparece en Principal cuando la base está vacía.

## Pantallas

- **Principal**: selector de jornada, grupos y resultados de cada ronda. Un admin puede capturar
  un nuevo resultado por grupo (elige la rotación de parejas y el marcador).
- **Ranking**: puntos = diferencia de games acumulada + 2 pts de asistencia por jornada jugada.
- **Pelotas**: rol de quién lleva pelotas por jornada próxima, con sugerencia automática basada en
  quién ha llevado menos veces, e historial de jornadas ya jugadas.

Sin iniciar sesión, todo se ve en modo lectura. Con la contraseña de admin (`/login`) aparecen los
formularios de edición.

## Modelo de datos

`prisma/schema.prisma` define: `Jugador`, `Jornada`, `JornadaParticipante` (asistencia confirmada),
`Grupo` / `GrupoJugador`, `Partido` / `PartidoJugador` (resultados) y `PelotasAsignacion`.

## Acceso de admin

Un solo link para todos: sin autenticarse se ve todo en solo lectura. Entrando a `/login` con la
contraseña de la variable de entorno `ADMIN_PASSWORD` se activa "Modo admin" (cookie firmada,
30 días), que habilita los formularios de edición y las server actions correspondientes. Las
server actions también rechazan la mutación del lado del servidor si no hay sesión de admin,
aunque se invoquen directamente.

## Desplegar (Firebase App Hosting + Cloud SQL)

El repo incluye `apphosting.yaml` para [Firebase App Hosting](https://firebase.google.com/docs/app-hosting),
que builda y sirve la app directo desde este repo de GitHub.

### 1. Crear la base de datos (Cloud SQL)

1. En la consola de Firebase/GCP, ve a **Cloud SQL** → **Crear instancia** → PostgreSQL.
2. Configúrala con IP pública, anota la contraseña del usuario `postgres` (o crea un usuario propio).
3. En **Conexiones → Redes autorizadas**, agrega `0.0.0.0/0` para permitir conexiones desde App
   Hosting (Cloud Run no tiene IP fija). Requiere SSL, así que sigue siendo razonablemente seguro,
   pero si quieres más aislamiento la alternativa es una VPC privada + conector, más avanzado de
   configurar.
4. Crea una base de datos (ej. `ligas_de_padel`) dentro de la instancia.
5. Arma tu `DATABASE_URL`:
   `postgresql://USUARIO:PASSWORD@IP_PUBLICA:5432/ligas_de_padel?sslmode=require`

### 2. Guardar los secrets

`apphosting.yaml` espera dos secrets de Secret Manager (no van en texto plano en el repo):

- `database-url` → la cadena de conexión del paso anterior.
- `admin-password` → la contraseña que quieras usar para entrar como admin en `/login`.

La consola de Firebase pide crear/vincular estos secrets automáticamente la primera vez que
despliegas y detecta que `apphosting.yaml` los referencia.

### 3. Conectar el repo

1. En la consola de Firebase → **App Hosting** → **Crear backend**.
2. Conecta GitHub, selecciona este repositorio y la rama a desplegar.
3. Firebase detecta Next.js y usa `apphosting.yaml`.
4. Al arrancar, el script `start` corre `prisma migrate deploy` (aplica el esquema si falta) y
   luego `next start`. **No** siembra datos automáticamente — eso es a propósito, para no pisar
   resultados reales en cada reinicio.
5. Con la base recién creada (vacía), entra a la URL pública, inicia sesión como admin en
   `/login`, y usa el botón **"Cargar datos de ejemplo"** en Principal una sola vez.

No se pudo probar un despliegue real contra Cloud SQL en esta sesión (no había cuenta de
Firebase/GCP conectada), así que si algo en `apphosting.yaml` o los pasos de arriba no coincide
con la consola actual, ajústalo según lo que Firebase te indique ahí.
