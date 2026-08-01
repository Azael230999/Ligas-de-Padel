import {
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

export function watchJornadas(callback, onError) {
  const q = query(jornadasCol, orderBy("orden", "asc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
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

export async function crearJornada(jornadasActuales, { nombre, canchas }) {
  const siguienteOrden = Math.max(0, ...jornadasActuales.map((j) => j.orden)) + 1;
  const id = String(siguienteOrden);
  await setDoc(doc(jornadasCol, id), {
    nombre: nombre || `Jornada ${siguienteOrden}`,
    orden: siguienteOrden,
    canchas: Number(canchas) || 1,
    participantes: [],
  });
  return id;
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

export function calcularRanking(jornadas) {
  const stats = new Map();
  const asegurar = (nombre) => {
    if (!stats.has(nombre)) stats.set(nombre, { diffGames: 0, jornadas: new Set(), rondas: 0 });
    return stats.get(nombre);
  };

  for (const jornada of jornadasConGrupos(jornadas)) {
    for (const [grupo, jugadores] of Object.entries(jornada.grupos)) {
      for (const j of jugadores) {
        asegurar(j).jornadas.add(jornada.id);
      }
      const rondas = (jornada.resultados && jornada.resultados[grupo]) || [];
      for (const r of rondas) {
        const [g1, g2] = r.marcador.split("/").map(Number);
        for (const p of r.pareja1) {
          const s = asegurar(p);
          s.diffGames += g1 - g2;
          s.rondas += 1;
        }
        for (const p of r.pareja2) {
          const s = asegurar(p);
          s.diffGames += g2 - g1;
          s.rondas += 1;
        }
      }
    }
  }

  return Array.from(stats.entries())
    .map(([nombre, s]) => {
      const asistencia = s.jornadas.size * 2;
      return {
        nombre,
        diffGames: s.diffGames,
        asistencia,
        rondas: s.rondas,
        jornadasJugadas: s.jornadas.size,
        pts: s.diffGames + asistencia,
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
      historial.push({
        jornadaId: jornada.id,
        jornadaNombre: jornada.nombre,
        grupo,
        companeros: jugadores.filter((j) => j !== nombre),
        partidos,
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
