type Jugador = { id: number; nombre: string };

export type Rotacion = {
  value: string;
  label: string;
  pareja1: [Jugador, Jugador];
  pareja2: [Jugador, Jugador];
};

// Con 4 jugadores solo existen 3 formas distintas de armar dos parejas.
export function pairingsDeCuatro(jugadores: Jugador[]): Rotacion[] {
  if (jugadores.length !== 4) return [];
  const [a, b, c, d] = jugadores;
  const combos: [[Jugador, Jugador], [Jugador, Jugador]][] = [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ];
  return combos.map(([pareja1, pareja2]) => ({
    value: `${pareja1[0].id}-${pareja1[1].id}-${pareja2[0].id}-${pareja2[1].id}`,
    label: `${pareja1[0].nombre} y ${pareja1[1].nombre} vs ${pareja2[0].nombre} y ${pareja2[1].nombre}`,
    pareja1,
    pareja2,
  }));
}

function parIds(pareja: { id: number }[]): string {
  return pareja
    .map((p) => p.id)
    .sort((x, y) => x - y)
    .join(",");
}

export function rotacionYaJugada(
  partidos: { pareja1: { id: number }[]; pareja2: { id: number }[] }[],
  rotacion: Rotacion
): boolean {
  const objetivo = [parIds(rotacion.pareja1), parIds(rotacion.pareja2)].sort();
  return partidos.some((p) => {
    const actual = [parIds(p.pareja1), parIds(p.pareja2)].sort();
    return actual[0] === objetivo[0] && actual[1] === objetivo[1];
  });
}
