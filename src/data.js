import {
  collection,
  deleteDoc,
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

export function jornadasProximasPelotas(jornadas) {
  return jornadas.filter((j) => !j.grupos && j.participantes && j.participantes.length > 0);
}

export function jornadasHistorialPelotas(jornadas) {
  return jornadasConGrupos(jornadas);
}

export async function crearResultado(jornadaId, grupoNombre, resultado) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, new FieldPath("resultados", grupoNombre), arrayUnion(resultado));
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

export async function agregarParticipante(jornadaId, nombre) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, { participantes: arrayUnion(nombre) });
}

export async function quitarParticipante(jornadaId, nombre) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, { participantes: arrayRemove(nombre) });
}

export async function crearGrupo(jornadaId, grupoNombre, jugadores) {
  const ref = doc(db, "jornadas", jornadaId);
  await updateDoc(ref, new FieldPath("grupos", grupoNombre), jugadores);
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
  const historial = jornadasHistorialPelotas(jornadas);
  const conteo = {};
  const jugadas = {};

  for (const jornada of historial) {
    for (const nombre of jornada.pelotasAsignados || []) {
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    }
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

export function sugerirAsignados(participantes, canchas, conteo) {
  const orden = [...participantes].sort((a, b) => {
    const diff = (conteo[a] || 0) - (conteo[b] || 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
  return orden.slice(0, canchas);
}
