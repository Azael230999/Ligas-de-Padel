import { useState } from "react";
import { Download, Trash2, Users } from "lucide-react";
import { COLORS } from "../colors";
import {
  agregarParticipante,
  crearGrupo,
  crearJornada,
  editarGrupo,
  eliminarGrupo,
  eliminarJornada,
  exportarDatos,
  jugadoresConocidos,
  quitarParticipante,
} from "../data";
import { useToast } from "../toast";

function NuevaJornadaForm({ jornadas }) {
  const [nombre, setNombre] = useState("");
  const [canchas, setCanchas] = useState(3);
  const [creando, setCreando] = useState(false);
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await crearJornada(jornadas, { nombre: nombre.trim(), canchas });
      setNombre("");
      setCanchas(3);
      showToast("Jornada creada ✓");
    } catch (err) {
      showToast("No se pudo crear la jornada.", "error");
    }
    setCreando(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 mb-6 flex flex-col gap-3"
      style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.lima }}>
        Nueva jornada
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder={`Jornada ${Math.max(0, ...jornadas.map((j) => j.orden)) + 1}`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium flex-1"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <input
          type="number"
          min={1}
          value={canchas}
          onChange={(e) => setCanchas(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-mono font-bold w-20"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
      </div>
      <button
        type="submit"
        disabled={creando}
        className="rounded-xl py-2.5 text-sm font-black"
        style={{ background: COLORS.lima, color: COLORS.tinta }}
      >
        {creando ? "Creando…" : "Crear jornada"}
      </button>
    </form>
  );
}

function ArmarGrupo({ jornada }) {
  const [seleccion, setSeleccion] = useState([]);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const showToast = useToast();

  const disponibles = (jornada.participantes || []).filter(
    (p) => !Object.values(jornada.grupos || {}).some((jugadores) => jugadores.includes(p))
  );

  const toggle = (nombre) => {
    setSeleccion((prev) =>
      prev.includes(nombre) ? prev.filter((n) => n !== nombre) : prev.length < 4 ? [...prev, nombre] : prev
    );
  };

  const numeroGrupo = Object.keys(jornada.grupos || {}).length + 1;

  const handleCrear = async () => {
    if (seleccion.length !== 4) return;
    setGuardando(true);
    try {
      await crearGrupo(jornada.id, nombreGrupo.trim() || `Grupo ${numeroGrupo}`, seleccion);
      setSeleccion([]);
      setNombreGrupo("");
      showToast("Grupo creado ✓");
    } catch (err) {
      showToast("No se pudo crear el grupo.", "error");
    }
    setGuardando(false);
  };

  if (disponibles.length === 0) return null;

  return (
    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.linea}` }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.limaSoft }}>
        Armar grupo (elige 4)
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {disponibles.map((p) => {
          const elegido = seleccion.includes(p);
          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: elegido ? COLORS.lima : COLORS.cancha,
                color: elegido ? COLORS.tinta : COLORS.crema,
                border: `1px solid ${elegido ? COLORS.lima : COLORS.linea}`,
              }}
            >
              {p}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Grupo ${numeroGrupo}`}
          value={nombreGrupo}
          onChange={(e) => setNombreGrupo(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium flex-1"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <button
          onClick={handleCrear}
          disabled={seleccion.length !== 4 || guardando}
          className="rounded-xl px-4 py-2 text-sm font-black whitespace-nowrap"
          style={{
            background: seleccion.length === 4 ? COLORS.lima : COLORS.cancha,
            color: seleccion.length === 4 ? COLORS.tinta : COLORS.limaSoft,
          }}
        >
          Crear grupo ({seleccion.length}/4)
        </button>
      </div>
    </div>
  );
}

function GrupoCard({ jornada, grupoNombre }) {
  const jugadores = jornada.grupos[grupoNombre];
  const disponibles = (jornada.participantes || []).filter(
    (p) => !Object.values(jornada.grupos || {}).some((js) => js.includes(p))
  );
  const showToast = useToast();

  const quitar = (nombre) => {
    if (!confirm(`¿Quitar a "${nombre}" del grupo "${grupoNombre}"?`)) return;
    editarGrupo(jornada.id, grupoNombre, jugadores.filter((j) => j !== nombre))
      .then(() => showToast("Jugador quitado ✓"))
      .catch(() => showToast("No se pudo quitar al jugador.", "error"));
  };

  const agregar = (nombre) => {
    if (jugadores.length >= 4) return;
    editarGrupo(jornada.id, grupoNombre, [...jugadores, nombre])
      .then(() => showToast("Jugador agregado ✓"))
      .catch(() => showToast("No se pudo agregar al jugador.", "error"));
  };

  const handleEliminarGrupo = () => {
    if (!confirm(`¿Borrar "${grupoNombre}"? También se borran sus resultados capturados.`)) return;
    eliminarGrupo(jornada.id, grupoNombre)
      .then(() => showToast("Grupo borrado ✓"))
      .catch(() => showToast("No se pudo borrar el grupo.", "error"));
  };

  return (
    <div className="mb-3 pb-3" style={{ borderBottom: `1px solid ${COLORS.linea}` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold" style={{ color: COLORS.crema }}>
          {grupoNombre}
        </span>
        <button onClick={handleEliminarGrupo} title="Borrar grupo">
          <Trash2 size={14} color="#F5716B" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {jugadores.map((j) => (
          <button
            key={j}
            onClick={() => quitar(j)}
            title="Quitar del grupo"
            className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            style={{ background: COLORS.lima, color: COLORS.tinta }}
          >
            {j} <span>×</span>
          </button>
        ))}
        {jugadores.length < 4 &&
          disponibles.map((p) => (
            <button
              key={p}
              onClick={() => agregar(p)}
              title="Agregar al grupo"
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "transparent", color: COLORS.limaSoft, border: `1px dashed ${COLORS.linea}` }}
            >
              + {p}
            </button>
          ))}
      </div>
    </div>
  );
}

function JornadaAdminCard({ jornada, conocidos }) {
  const [nuevoParticipante, setNuevoParticipante] = useState("");
  const showToast = useToast();

  const handleAgregar = async (e) => {
    e.preventDefault();
    const nombre = nuevoParticipante.trim();
    if (!nombre) return;
    try {
      await agregarParticipante(jornada.id, nombre, conocidos);
      setNuevoParticipante("");
      showToast("Participante agregado ✓");
    } catch (err) {
      showToast("No se pudo agregar al participante.", "error");
    }
  };

  const handleEliminarJornada = async () => {
    if (!confirm(`¿Borrar "${jornada.nombre}" por completo? No se puede deshacer.`)) return;
    try {
      await eliminarJornada(jornada.id);
      showToast("Jornada borrada ✓");
    } catch (err) {
      showToast("No se pudo borrar la jornada.", "error");
    }
  };

  const handleQuitarParticipante = (nombre) => {
    if (!confirm(`¿Quitar a "${nombre}" de esta jornada?`)) return;
    quitarParticipante(jornada.id, nombre)
      .then(() => showToast("Participante quitado ✓"))
      .catch(() => showToast("No se pudo quitar al participante.", "error"));
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold" style={{ color: COLORS.crema }}>
          {jornada.nombre}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: COLORS.limaSoft }}>
            {jornada.canchas} {jornada.canchas === 1 ? "cancha" : "canchas"}
          </span>
          <button onClick={handleEliminarJornada} title="Borrar jornada">
            <Trash2 size={15} color="#F5716B" />
          </button>
        </div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: COLORS.limaSoft }}>
        Participantes ({(jornada.participantes || []).length})
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {(jornada.participantes || []).map((p) => (
          <button
            key={p}
            onClick={() => handleQuitarParticipante(p)}
            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            style={{ background: COLORS.cancha, color: COLORS.crema }}
            title="Quitar"
          >
            {p} <span style={{ color: COLORS.limaSoft }}>×</span>
          </button>
        ))}
      </div>
      <form onSubmit={handleAgregar} className="flex gap-2 mb-1">
        <input
          type="text"
          list={`conocidos-${jornada.id}`}
          placeholder="Nombre del jugador"
          value={nuevoParticipante}
          onChange={(e) => setNuevoParticipante(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium flex-1"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <datalist id={`conocidos-${jornada.id}`}>
          {conocidos.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button
          type="submit"
          className="rounded-xl px-4 py-2 text-sm font-black"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          Agregar
        </button>
      </form>

      {Object.keys(jornada.grupos || {}).length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.linea}` }}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.limaSoft }}>
            Grupos armados (toca a alguien para quitarlo, o "+ nombre" para agregarlo)
          </p>
          {Object.keys(jornada.grupos).map((nombre) => (
            <GrupoCard key={nombre} jornada={jornada} grupoNombre={nombre} />
          ))}
        </div>
      )}

      <ArmarGrupo jornada={jornada} />
    </div>
  );
}

export function AdminScreen({ jornadas }) {
  const conocidos = jugadoresConocidos(jornadas);
  const ordenadas = [...jornadas].sort((a, b) => b.orden - a.orden);
  const showToast = useToast();

  const handleExportar = () => {
    try {
      exportarDatos(jornadas);
      showToast("Respaldo descargado ✓");
    } catch (err) {
      showToast("No se pudo generar el respaldo.", "error");
    }
  };

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} color={COLORS.lima} />
          <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
            Administrar jornadas
          </h2>
        </div>
        <button
          onClick={handleExportar}
          title="Descargar respaldo en JSON"
          className="flex items-center gap-1 text-[11px] font-bold underline"
          style={{ color: COLORS.lima }}
        >
          <Download size={13} /> Exportar
        </button>
      </div>

      <NuevaJornadaForm jornadas={jornadas} />

      <div className="space-y-3">
        {ordenadas.map((j) => (
          <JornadaAdminCard key={j.id} jornada={j} conocidos={conocidos} />
        ))}
      </div>
    </div>
  );
}
