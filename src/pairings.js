// Con 4 jugadores solo existen 3 formas distintas de armar dos parejas.
export function pairingsDeCuatro(jugadores) {
  if (jugadores.length !== 4) return [];
  const [a, b, c, d] = jugadores;
  const combos = [
    [
      [a, b],
      [c, d],
    ],
    [
      [a, c],
      [b, d],
    ],
    [
      [a, d],
      [b, c],
    ],
  ];
  return combos.map(([pareja1, pareja2]) => ({
    value: `${pareja1[0]}|${pareja1[1]}|${pareja2[0]}|${pareja2[1]}`,
    label: `${pareja1[0]} y ${pareja1[1]} vs ${pareja2[0]} y ${pareja2[1]}`,
    pareja1,
    pareja2,
  }));
}

function parNombres(pareja) {
  return [...pareja].sort().join(",");
}

export function rotacionYaJugada(resultados, rotacion) {
  const objetivo = [parNombres(rotacion.pareja1), parNombres(rotacion.pareja2)].sort();
  return resultados.some((r) => {
    const actual = [parNombres(r.pareja1), parNombres(r.pareja2)].sort();
    return actual[0] === objetivo[0] && actual[1] === objetivo[1];
  });
}
