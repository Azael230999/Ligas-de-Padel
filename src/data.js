import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  FieldPath,
  arrayUnion,
  arrayRemove,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { SEED_JORNADAS } from "./seedData";

const jornadasCol = collection(db, "jornadas");
const ajustesCol = collection(db, "ajustes");

export function watchJornadas(callback, onError) {
  const q = query(jornadasCol, orderBy("orden", "asc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export function watchAjustes(callback, onError) {
  return onSnapshot(
    ajustesCol,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// Ajuste manual de puntos: cubre casos que el reglamento deja a criterio
// humano (puntuación inicial de un jugador nuevo, exención de una
// penalización por lesión, cancelación el mismo día que desarma una
// cancha, etc.) sin necesitar una regla de negocio distinta por caso.
export async function crearAjuste(jugador, puntos, motivo) {
  await addDoc(ajustesCol, {
    jugador,
    puntos: Number(puntos),
    motivo: motivo || "",
    fecha: new Date().toISOString().slice(0, 10),
  });
}

export async function eliminarAjuste(ajusteId) {
  await deleteDoc(doc(ajustesCol, ajusteId));
}

export function jornadasConGrupos(jornadas) {
  return jornadas.filter((j) => j.grupos && Object.keys(j.grupos).length > 0);
}

// Jornadas donde todavía falta (o se quiere ajustar) quién lleva pelotas.
// No depende de si ya se armaron grupos: se puede asignar antes, durante o
// después de armar los grupos, para no quedar "atorado" sin poder resolverlo.
export function jornadasPelotasPendientes(jornadas) {
  return jornadas.filter((j) => j.participantes && j.participantes.length > 0);
}

// Recap de jornadas donde ya se jugó (hay grupos armados), para mostrar el
// historial de quién llevó pelotas cada vez.
export function jornadasHistorialPelotas(jornadas) {
  return jornadasConGrupos(jornadas);
}

export async function crearResultado(jornadaId, grupoNombre, resultado) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, new FieldPath("resultados", grupoNombre), arrayUnion(resultado));
}

export async function editarResultado(jornadaId, grupoNombre, resultadosActuales, index, nuevoResultado) {
  const ref = doc(db, "jornadas", jornadaId);
  const nuevos = resultadosActuales.map((r, i) => (i === index ? nuevoResultado : r));
  await updateDoc(ref, new FieldPath("resultados", grupoNombre), nuevos);
}

export async function eliminarResultado(jornadaId, grupoNombre, resultadoActual) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, new FieldPath("resultados", grupoNombre), arrayRemove(resultadoActual));
}

export async function toggleAsignacionPelotas(jornadaId, jugador, yaAsignado) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, {
    pelotasAsignados: yaAsignado ? arrayRemove(jugador) : arrayUnion(jugador),
  });
}

export async function aplicarSugerenciaPelotas(jornadaId, sugeridos) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, { pelotasAsignados: sugeridos });
}

// Invitado: no es miembro de la Liga, así que nunca suma puntos/asistencia
// (aunque sí puede jugar). Si una cancha llega a tener 2 o más invitados,
// esa cancha completa deja de ser puntuable para todos (regla del
// reglamento) — eso se aplica en calcularRanking, aquí solo se guarda
// quién es invitado esa jornada.
export async function toggleInvitado(jornadaId, jugador, esInvitado) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, {
    invitados: esInvitado ? arrayRemove(jugador) : arrayUnion(jugador),
  });
}

// Tardanza: llegar tarde le quita el bono de asistencia (+2) de esa
// jornada, pero no afecta sus games ni si cuenta como jornada jugada.
export async function toggleTardanza(jornadaId, jugador, yaTarde) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, {
    tardanzas: yaTarde ? arrayRemove(jugador) : arrayUnion(jugador),
  });
}

export function jugadoresConocidos(jornadas) {
  const nombres = new Set();
  for (const j of jornadas) {
    for (const jugadores of Object.values(j.grupos || {})) {
      for (const nombre of jugadores) nombres.add(nombre);
    }
    for (const nombre of j.participantes || []) nombres.add(nombre);
    for (const nombre of j.pelotasAsignados || []) nombres.add(nombre);
  }
  return Array.from(nombres).sort((a, b) => a.localeCompare(b));
}

export async function crearJornada(jornadasActuales, { nombre, canchas, fecha, temporada }) {
  const siguienteOrden = Math.max(0, ...jornadasActuales.map((j) => j.orden)) + 1;
  const id = String(siguienteOrden);
  await setDoc(doc(jornadasCol, id), {
    nombre: nombre || `Jornada ${siguienteOrden}`,
    orden: siguienteOrden,
    canchas: Number(canchas) || 1,
    participantes: [],
    fecha: fecha || new Date().toISOString().slice(0, 10),
    temporada: temporada || "",
  });
  return id;
}

// Última temporada usada (por fecha de jornada), para pre-llenar el campo al
// crear la siguiente — normalmente todas las jornadas seguidas son de la
// misma temporada.
export function ultimaTemporada(jornadas) {
  const conTemporada = jornadas.filter((j) => j.temporada);
  if (conTemporada.length === 0) return "";
  return [...conTemporada].sort((a, b) => (a.fecha || "").localeCompare(b.fecha || "")).at(-1).temporada;
}

export async function eliminarJornada(jornadaId) {
  await deleteDoc(doc(db, "jornadas", jornadaId));
}

// Si ya existe un nombre igual sin importar mayúsculas/espacios (ej. "Juan"
// vs "juan "), reusa esa versión en vez de crear a un jugador "fantasma"
// distinto en el ranking y el balance de pelotas.
export function resolverNombre(nombre, conocidos) {
  const limpio = nombre.trim();
  const existente = conocidos.find((c) => c.toLowerCase() === limpio.toLowerCase());
  return existente || limpio;
}

export async function agregarParticipante(jornadaId, nombre, conocidos = []) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, { participantes: arrayUnion(resolverNombre(nombre, conocidos)) });
}

export async function quitarParticipante(jornadaId, nombre) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, { participantes: arrayRemove(nombre) });
}

export async function crearGrupo(jornadaId, grupoNombre, jugadores) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, new FieldPath("grupos", grupoNombre), jugadores);
}

// Mismo cambio que crearGrupo (sobreescribe el arreglo de jugadores del
// grupo); se usa un nombre distinto solo para que se lea claro en el
// llamador si se está armando un grupo nuevo o editando uno existente.
export const editarGrupo = crearGrupo;

// Arma las canchas de una jornada de un jazo, ordenando a sus participantes
// por su ranking actual (de mejor a peor) y cortando en bloques de 4, tal
// como marca el reglamento ("los 4 mejor rankeados juegan en la 1ra
// cancha..."). Los que sobran (si no son múltiplo de 4) quedan sin cancha
// para completarse a mano (ej. con un invitado) desde la UI existente.
export async function armarCanchasPorRanking(jornada, todasLasJornadas, ajustes = []) {
  const ranking = calcularRanking(todasLasJornadas, ajustes);
  const puntos = Object.fromEntries(ranking.map((r) => [r.nombre, r.pts]));
  const ordenados = [...(jornada.participantes || [])].sort((a, b) => {
    const diff = (puntos[b] ?? 0) - (puntos[a] ?? 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  const grupos = {};
  let numeroCancha = 1;
  for (let i = 0; i + 4 <= ordenados.length; i += 4) {
    grupos[`Cancha ${numeroCancha}`] = ordenados.slice(i, i + 4);
    numeroCancha += 1;
  }

  const ref = doc(db, "jornadas", jornada.id);
  await updateDoc(ref, { grupos });
  return { canchasArmadas: numeroCancha - 1, sinCancha: ordenados.slice((numeroCancha - 1) * 4) };
}

export async function eliminarGrupo(jornadaId, grupoNombre) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(
    ref,
    new FieldPath("grupos", grupoNombre),
    deleteField(),
    new FieldPath("resultados", grupoNombre),
    deleteField()
  );
}

export async function seedInitialData() {
  const existentes = await getDocs(jornadasCol);
  if (!existentes.empty) throw new Error("La base ya tiene datos, no se vuelve a sembrar.");

  const batch = writeBatch(db);
  for (const jornada of SEED_JORNADAS) {
    batch.set(doc(jornadasCol, String(jornada.orden)), jornada);
  }
  await batch.commit();
}

// Penalización por inactividad: -5 pts, en vivo (no se guarda), para
// cualquiera que ya haya jugado antes en la liga y lleve 4 semanas de
// calendario o más sin aparecer desde la jornada más reciente con fecha.
// Al volver a jugar, la penalización desaparece sola en el siguiente
// cálculo — no es un evento que haya que revertir a mano. Para un caso
// ambiguo (lesión, etc.) se compensa con un ajuste manual.
const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

export function calcularRanking(jornadas, ajustes = []) {
  const stats = new Map();
  const asegurar = (nombre) => {
    if (!stats.has(nombre))
      stats.set(nombre, { diffGames: 0, jornadas: new Set(), rondas: 0, asistencia: 0, ultimaFecha: null });
    return stats.get(nombre);
  };

  let fechaMasReciente = null;

  for (const jornada of jornadasConGrupos(jornadas)) {
    const invitados = jornada.invitados || [];
    const tardanzas = jornada.tardanzas || [];
    if (jornada.fecha && (!fechaMasReciente || jornada.fecha > fechaMasReciente)) {
      fechaMasReciente = jornada.fecha;
    }
    for (const [grupo, jugadores] of Object.entries(jornada.grupos)) {
      // Con 2 o más invitados en la misma cancha, esa cancha deja de ser
      // puntuable para todos (miembros incluidos), tal como marca el
      // reglamento.
      const invitadosEnGrupo = jugadores.filter((j) => invitados.includes(j));
      if (invitadosEnGrupo.length >= 2) continue;

      for (const j of jugadores) {
        if (invitados.includes(j)) continue; // un invitado nunca suma puntos/asistencia
        const s = asegurar(j);
        s.jornadas.add(jornada.id);
        if (!tardanzas.includes(j)) s.asistencia += 2; // llegar tarde pierde el bono
        if (jornada.fecha && (!s.ultimaFecha || jornada.fecha > s.ultimaFecha)) s.ultimaFecha = jornada.fecha;
      }
      const rondas = (jornada.resultados && jornada.resultados[grupo]) || [];
      for (const r of rondas) {
        const [g1, g2] = r.marcador.split("/").map(Number);
        for (const p of r.pareja1) {
          if (invitados.includes(p)) continue;
          const s = asegurar(p);
          s.diffGames += g1 - g2;
          s.rondas += 1;
        }
        for (const p of r.pareja2) {
          if (invitados.includes(p)) continue;
          const s = asegurar(p);
          s.diffGames += g2 - g1;
          s.rondas += 1;
        }
      }
    }
  }

  const ajustesPorJugador = {};
  for (const a of ajustes) {
    ajustesPorJugador[a.jugador] = (ajustesPorJugador[a.jugador] || 0) + a.puntos;
  }
  for (const nombre of Object.keys(ajustesPorJugador)) asegurar(nombre); // aparece aunque no haya jugado

  return Array.from(stats.entries())
    .map(([nombre, s]) => {
      const ajuste = ajustesPorJugador[nombre] || 0;
      let penalizacionInactividad = 0;
      if (fechaMasReciente && s.ultimaFecha) {
        const semanas = (new Date(fechaMasReciente) - new Date(s.ultimaFecha)) / SEMANA_MS;
        if (semanas >= 4) penalizacionInactividad = -5;
      }
      return {
        nombre,
        diffGames: s.diffGames,
        asistencia: s.asistencia,
        ajuste,
        penalizacionInactividad,
        rondas: s.rondas,
        jornadasJugadas: s.jornadas.size,
        pts: s.diffGames + s.asistencia + ajuste + penalizacionInactividad,
      };
    })
    .sort((a, b) => b.pts - a.pts);
}

export function calcularBalancePelotas(jornadas) {
  const conteo = {};
  for (const jornada of jornadas) {
    for (const nombre of jornada.pelotasAsignados || []) {
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    }
  }

  // "Jugadas" = jornadas donde ya se armaron grupos (asistencia real),
  // independiente de si el rol de pelotas ya se resolvió o no.
  const jugadas = {};
  for (const jornada of jornadasConGrupos(jornadas)) {
    const participantes = new Set();
    for (const jugadores of Object.values(jornada.grupos || {})) {
      for (const j of jugadores) participantes.add(j);
    }
    for (const nombre of participantes) {
      jugadas[nombre] = (jugadas[nombre] || 0) + 1;
    }
  }

  return { conteo, jugadas };
}

// Respaldo manual: descarga todas las jornadas tal cual están en Firestore
// como un archivo .json, por si algo sale mal y se necesita restaurar a mano.
export function exportarDatos(jornadas) {
  const contenido = JSON.stringify(jornadas, null, 2);
  const blob = new Blob([contenido], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  enlace.href = url;
  enlace.download = `respaldo-jornadas-${fecha}.json`;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Historial de un jugador: en qué jornadas jugó, con quién, y sus
// partidos capturados en cada una. Se usa en la vista de perfil.
export function perfilJugador(jornadas, nombre) {
  const historial = [];
  for (const jornada of jornadasConGrupos(jornadas)) {
    for (const [grupo, jugadores] of Object.entries(jornada.grupos)) {
      if (!jugadores.includes(nombre)) continue;
      const rondas = (jornada.resultados && jornada.resultados[grupo]) || [];
      const partidos = rondas.filter((r) => r.pareja1.includes(nombre) || r.pareja2.includes(nombre));
      const invitadosEnGrupo = jugadores.filter((j) => (jornada.invitados || []).includes(j));
      historial.push({
        jornadaId: jornada.id,
        jornadaNombre: jornada.nombre,
        grupo,
        companeros: jugadores.filter((j) => j !== nombre),
        partidos,
        esInvitado: (jornada.invitados || []).includes(nombre),
        puntuable: invitadosEnGrupo.length < 2,
      });
    }
  }
  return historial.sort((a, b) => Number(b.jornadaId) - Number(a.jornadaId));
}

export function sugerirAsignados(participantes, canchas, conteo) {
  const orden = [...participantes].sort((a, b) => {
    const diff = (conteo[a] || 0) - (conteo[b] || 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
  return orden.slice(0, canchas);
}
