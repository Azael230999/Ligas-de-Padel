# Ligas de Padel

App de seguimiento de jornadas para una liga de pádel: grupos, resultados, ranking y rol de pelotas.

## Stack

- [Vite](https://vitejs.dev) + React + Tailwind CSS — SPA de puro cliente, sin servidor.
- [Firestore](https://firebase.google.com/docs/firestore) para persistencia (lectura pública, escritura solo autenticada).
- [Firebase Auth](https://firebase.google.com/docs/auth) (correo/contraseña) para el acceso de admin.
- Hosting gratis en **GitHub Pages** vía GitHub Actions.

## Empezar (local)

Necesitas los [emuladores de Firebase](https://firebase.google.com/docs/emulator-suite) para desarrollar sin
tocar datos reales (requieren Java, ya viene con `firebase-tools`):

```bash
npm install
npx firebase emulators:start --project demo-ligas-de-padel --only firestore,auth
```

En otra terminal:

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). El `.env` local ya apunta al emulador
(`VITE_USE_EMULATORS=true` con credenciales de mentira — no hace falta un proyecto real de Firebase
para desarrollar).

Para entrar como admin en local, crea un usuario en el emulador (una sola vez):

```bash
curl -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test1234","returnSecureToken":true}'
```

Luego entra desde la app con ese correo/contraseña y usa **"Cargar datos de ejemplo"** en Principal.

## Pantallas

- **Principal**: selector de jornada, grupos y resultados de cada ronda. Un admin puede capturar
  un nuevo resultado por grupo (elige la rotación de parejas y el marcador).
- **Ranking**: puntos = diferencia de games acumulada + 2 pts de asistencia por jornada jugada.
- **Pelotas**: rol de quién lleva pelotas por jornada próxima, con sugerencia automática basada en
  quién ha llevado menos veces, e historial de jornadas ya jugadas.

Sin iniciar sesión, todo se ve en modo lectura. Iniciando sesión (botón "Entrar como admin")
aparecen los formularios de edición.

## Modelo de datos

Una sola colección `jornadas`, un documento por jornada:

```
{
  nombre, orden, canchas,
  grupos: { "Grupo 1": [nombres...], ... },
  resultados: { "Grupo 1": [{ pareja1: [nombre,nombre], pareja2: [nombre,nombre], marcador: "6/4" }], ... },
  participantes: [nombres...],       // cuando aún no hay grupos armados
  pelotasAsignados: [nombres...],
}
```

Ranking y balance de pelotas se calculan en el cliente a partir de todos los documentos de
`jornadas` (ver `src/data.js`), igual que en el mock original.

## Seguridad (`firestore.rules`)

Cualquiera puede leer `jornadas` (link de solo lectura). Solo un usuario autenticado (el admin de
la liga) puede crear/editar/borrar. No hay roles ni multi-tenant: basta con que exista una sola
cuenta de Firebase Auth para el admin.

## Desplegar

### 1. Crear el proyecto de Firebase (si no lo tienes)

1. En la [consola de Firebase](https://console.firebase.google.com), crea o abre tu proyecto.
2. **Build → Firestore Database** → crear base de datos (modo producción, cualquier región).
3. **Build → Authentication** → habilitar el proveedor **Correo/contraseña**, y en la pestaña
   **Users** agrega manualmente al admin (tu correo + una contraseña).
4. **Configuración del proyecto → Tus apps → Web** (`</>`) para registrar una web app y obtener el
   `firebaseConfig`. Ese valor ya está escrito directo en `src/firebase.js` — es público a
   propósito (la seguridad la da `firestore.rules`, no el secreto de la key), así que no hace
   falta pasarlo como secret/variable de entorno en ningún lado.

### 2. Publicar `firestore.rules`

Desde tu compu, con `npx firebase login` una sola vez y luego:

```bash
npx firebase deploy --only firestore:rules --project TU_PROJECT_ID
```

### 3. Activar GitHub Pages

Repo → **Settings → Pages** → en "Build and deployment", **Source: GitHub Actions**.

### 4. Desplegar

El workflow `.github/workflows/deploy.yml` builda y publica en cada push a `main` (o desde la
pestaña **Actions → Deploy to GitHub Pages → Run workflow** para desplegar manualmente sin esperar
un push). La URL pública queda en `https://<tu-usuario>.github.io/Ligas-de-Padel/`.

No se pudo probar un despliegue real a GitHub Pages ni a un proyecto de Firebase real en esta
sesión (no había cuenta conectada) — sí se probó todo el flujo completo (login, sembrar datos,
capturar resultado, rol de pelotas, y que las reglas de seguridad bloquean escrituras sin sesión)
contra los emuladores de Firebase.
