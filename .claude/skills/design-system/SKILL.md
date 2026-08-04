---
name: design-system
description: Sistema de diseño de la app de Jornadas/Ranking de pádel (Liga 1RA) — colores, tipografía, espaciado y componentes. Úsalo siempre que crees o modifiques cualquier pantalla, componente o estilo visual de esta app.
---

# Sistema de diseño — App de Jornadas / Ranking

## Colores

Los colores reales del proyecto viven en `src/colors.js` (objeto `COLORS`,
usado vía `style={{ color: COLORS.xxx }}`, no como variables CSS). Estos son
los valores tal cual están hoy en el código — no aproximados:

| Token (COLORS.xxx) | Hex real | Uso |
|---|---|---|
| `cancha` | `#0B3D3A` | Fondo general |
| `canchaAlt` | `#0F4C47` | Tarjetas sobre el fondo |
| `lima` | `#D4F547` | Chips activos, botones primarios, números destacados |
| `limaSoft` | `#EEFAA8` | Labels secundarias, texto de apoyo |
| `crema` | `#F7F5EF` | Texto principal sobre fondo oscuro |
| `tinta` | `#131615` | Texto/ícono sobre fondo lima |
| `linea` | `#2A5651` | Bordes de chips/inputs inactivos |
| `"#F5716B"` (ad-hoc, no está en `COLORS`) | `#F5716B` | Eliminar, cancelar, error |

No inventar hex nuevos "parecidos" para estos roles — usar siempre estas
constantes de `COLORS` (importar desde `../colors`), y `"#F5716B"` para
danger hasta que se formalice como `COLORS.danger`.

## Tipografía

- **Display** (títulos de sección, "Liga 1RA"): sans bold, 26px. La app usa
  la fuente del sistema (`-apple-system, system-ui, sans-serif`) — Inter se
  menciona en algún inline style antiguo pero nunca se cargó de verdad, así
  que no hay que agregar un `<link>` a Google Fonts para "arreglarlo".
- **Numérico** (puntos de ranking, posición, contador de jugadores/canchas):
  clase `.tabular` ya definida en `src/index.css`:
  ```css
  .tabular {
    font-variant-numeric: tabular-nums;
    font-family: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", Menlo, Consolas, monospace;
  }
  ```
  Usa la pila de monoespaciadas *del sistema* a propósito (cero fuentes
  externas que cargar, PWA se mantiene rápida/offline-friendly). No
  reemplazar por `'IBM Plex Mono'`/`'JetBrains Mono'` vía Google Fonts.
  Aplicar `className="tabular"` siempre que un número se vaya a comparar
  visualmente con otros en la misma pantalla (tabla de ranking, tarjetas de
  stats del perfil, conteos de pelotas).
- **Body**: sans regular, 16px (clases Tailwind normales, sin cambios).
- **Label** (ej. "PARTICIPANTES DE ESTA JORNADA"): sans semibold uppercase,
  11px, `tracking-wide` (Tailwind) ≈ +0.5px letter-spacing.

## Iconografía

Librería: `lucide-react`. La nav inferior ya usa ícono + texto (Principal,
Ranking, Pelotas, Admin) — mantener ese patrón en cualquier navegación
nueva. El ícono de pelota de tenis (`src/components/PelotaIcon.jsx`) es la
marca de la app: usarlo en estados vacíos y en el header, no un ícono
genérico de lucide para esos casos.

## Chips y scroll horizontal

Cualquier fila de chips (jornadas, filtros) que pueda desbordar el ancho de
pantalla usa la clase `.chip-scroll` ya definida en `src/index.css`
(mask-image con degradado + scroll-snap) — nunca dejar que el contenido se
corte en seco sin indicio de que hay más:

```css
.chip-scroll {
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  mask-image: linear-gradient(to right, black 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 92%, transparent 100%);
}
.chip-scroll > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

Se aplica junto con las clases Tailwind existentes: `className="chip-scroll flex gap-2 overflow-x-auto ..."`.
Chip activo (componente `Chip.jsx`): `background: COLORS.lima; color: COLORS.tinta`.
Chip inactivo: `border: 1.5px solid COLORS.linea; color: COLORS.crema`.

## Jerarquía de estado "actual/vigente"

Cualquier elemento que represente el ítem "actual" (la jornada más reciente
en Admin, la próxima jornada en Principal) se distingue así:
- Ítem actual: badge en `COLORS.lima` con texto en `COLORS.tinta` ("ACTUAL"
  en Admin, "Próxima" en el chip de Principal/Ranking — ver prop `badge` de
  `Chip.jsx`).
- Ítems pasados: `opacity: 0.7` en la tarjeta completa (ver
  `JornadaAdminCard` en `AdminScreen.jsx`).

## Estados vacíos

Nunca solo texto plano. Siempre:
- Para una pantalla completa vacía: usar el componente
  `src/components/EmptyState.jsx` (ícono `PelotaIcon` + mensaje + CTA
  opcional).
- Para un mensaje vacío más chico dentro de una lista (ej. "Sin resultados
  capturados todavía." por cada cancha): `<PelotaIcon size={14} />` en línea
  junto al texto, sin el padding/centrado grande de `EmptyState` — ver el
  patrón ya usado en `PrincipalScreen.jsx`.
- CTA si aplica (ej. "+ Agregar resultado"): botón con
  `background: COLORS.lima; color: COLORS.tinta`.
