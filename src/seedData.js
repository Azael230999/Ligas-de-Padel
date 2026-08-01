// Datos de ejemplo para el botón "Cargar datos de ejemplo" (solo admin, solo
// si la colección "jornadas" está vacía). Un documento por jornada.
export const SEED_JORNADAS = [
  {
    nombre: "Jornada 1",
    orden: 1,
    canchas: 3,
    grupos: {
      "Grupo 1": ["Fulanito", "Juan", "Jorge", "Ricardo"],
      "Grupo 2": ["Pedro", "Luis", "Marco", "Sofía"],
      "Grupo 3": ["Ana", "Diego", "Karla", "Tomás"],
    },
    resultados: {
      "Grupo 1": [
        { pareja1: ["Fulanito", "Ricardo"], pareja2: ["Juan", "Jorge"], marcador: "6/4" },
        { pareja1: ["Juan", "Fulanito"], pareja2: ["Jorge", "Ricardo"], marcador: "2/6" },
        { pareja1: ["Fulanito", "Jorge"], pareja2: ["Ricardo", "Juan"], marcador: "3/6" },
      ],
      "Grupo 2": [
        { pareja1: ["Pedro", "Marco"], pareja2: ["Luis", "Sofía"], marcador: "6/3" },
        { pareja1: ["Luis", "Pedro"], pareja2: ["Sofía", "Marco"], marcador: "5/7" },
        { pareja1: ["Pedro", "Sofía"], pareja2: ["Marco", "Luis"], marcador: "6/2" },
      ],
      "Grupo 3": [],
    },
    pelotasAsignados: ["Fulanito", "Juan", "Jorge"],
  },
  {
    nombre: "Jornada 2",
    orden: 2,
    canchas: 3,
    grupos: {
      "Grupo 1": ["Fulanito", "Sofía", "Jorge", "Ana"],
      "Grupo 2": ["Pedro", "Juan", "Marco", "Diego"],
      "Grupo 3": ["Ricardo", "Luis", "Karla", "Tomás"],
    },
    resultados: {
      "Grupo 1": [
        { pareja1: ["Fulanito", "Sofía"], pareja2: ["Jorge", "Ana"], marcador: "6/4" },
        { pareja1: ["Jorge", "Fulanito"], pareja2: ["Ana", "Sofía"], marcador: "6/1" },
      ],
      "Grupo 2": [{ pareja1: ["Pedro", "Juan"], pareja2: ["Marco", "Diego"], marcador: "7/5" }],
      "Grupo 3": [],
    },
    pelotasAsignados: ["Ricardo", "Pedro", "Sofía"],
  },
  {
    nombre: "Jornada 3",
    orden: 3,
    canchas: 3,
    grupos: {
      "Grupo 1": ["Marco", "Juan", "Ana", "Ricardo"],
      "Grupo 2": ["Pedro", "Sofía", "Jorge", "Tomás"],
      "Grupo 3": ["Fulanito", "Luis", "Karla", "Diego"],
    },
    resultados: { "Grupo 1": [], "Grupo 2": [], "Grupo 3": [] },
    pelotasAsignados: ["Ana"],
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
