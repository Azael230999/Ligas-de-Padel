import { useState } from "react";
import { Trash2, Users } from "lucide-react";
import { COLORS } from "../colors";
import {
  agregarParticipante,
  crearGrupo,
  crearJornada,
  eliminarJornada,
  jugadoresConocidos,
  quitarParticipante,
} from "../data";

function NuevaJornadaForm({ jornadas }) {
  const [nombre, setNombre] = useState("");
  const [canchas, setCanchas] = useState(3);
  const [creando, setCreando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await crearJornada(jornadas, { nombre: nombre.trim(), canchas });
      setNombre("");
      setCanchas(3);
    } catch (err) {
      alert("No se pudo crear la jornada.");
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
    } catch (err) {
      alert("No se pudo crear el grupo.");
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

function JornadaAdminCard({ jornada, conocidos }) {
  const [nuevoParticipante, setNuevoParticipante] = useState("");

  const handleAgregar = async (e) => {
    e.preventDefault();
    const nombre = nuevoParticipante.trim();
    if (!nombre) return;
    await agregarParticipante(jornada.id, nombre).catch(() => {});
    setNuevoParticipante("");
  };

  const handleEliminarJornada = async () => {
    if (!confirm(`¿Borrar "${jornada.nombre}" por completo? No se puede deshacer.`)) return;
    await eliminarJornada(jornada.id).catch(() => {});
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
            onClick={() => quitarParticipante(jornada.id, p).catch(() => {})}
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
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: COLORS.limaSoft }}>
            Grupos armados
          </p>
          {Object.entries(jornada.grupos).map(([nombre, jugadores]) => (
            <p key={nombre} className="text-sm mb-1" style={{ color: COLORS.crema }}>
              <span className="font-bold">{nombre}:</span> {jugadores.join(", ")}
            </p>
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

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} color={COLORS.lima} />
        <h2 className="font-black text-lg" style={{ color: COLORS.crema }}>
          Administrar jornadas
        </h2>
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
