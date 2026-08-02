import { useRef, useState } from "react";
import { Clock, Download, Shuffle, Tag, Trash2, Upload, Users } from "lucide-react";
import { COLORS } from "../colors";
import {
  agregarParticipante,
  armarCanchasPorRanking,
  crearAjuste,
  crearGrupo,
  crearJornada,
  editarGrupo,
  eliminarAjuste,
  eliminarGrupo,
  eliminarJornada,
  exportarDatos,
  importarDatos,
  jugadoresConocidos,
  quitarParticipante,
  toggleInvitado,
  toggleTardanza,
  ultimaTemporada,
} from "../data";
import { useToast } from "../toast";

function NuevaJornadaForm({ jornadas }) {
  const [nombre, setNombre] = useState("");
  const [canchas, setCanchas] = useState(3);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [temporada, setTemporada] = useState(ultimaTemporada(jornadas));
  const [creando, setCreando] = useState(false);
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await crearJornada(jornadas, { nombre: nombre.trim(), canchas, fecha, temporada: temporada.trim() });
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
      <div className="flex gap-3">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium flex-1"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <input
          type="text"
          placeholder="Temporada (ej. Primavera 2026)"
          value={temporada}
          onChange={(e) => setTemporada(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium flex-1"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
      </div>
      <button
        type="submit"
        disabled={creando}
        className="rounded-xl py-2.5 text-sm font-black transition-transform active:scale-95"
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
      await crearGrupo(jornada.id, nombreGrupo.trim() || `Cancha ${numeroGrupo}`, seleccion);
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
        Armar cancha (elige 4)
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
          placeholder={`Cancha ${numeroGrupo}`}
          value={nombreGrupo}
          onChange={(e) => setNombreGrupo(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium flex-1"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <button
          onClick={handleCrear}
          disabled={seleccion.length !== 4 || guardando}
          className="rounded-xl px-4 py-2 text-sm font-black whitespace-nowrap transition-transform active:scale-95"
          style={{
            background: seleccion.length === 4 ? COLORS.lima : COLORS.cancha,
            color: seleccion.length === 4 ? COLORS.tinta : COLORS.limaSoft,
          }}
        >
          Crear cancha ({seleccion.length}/4)
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

function JornadaAdminCard({ jornada, conocidos, jornadas, ajustes }) {
  const [nuevoParticipante, setNuevoParticipante] = useState("");
  const [armando, setArmando] = useState(false);
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

  const disponiblesParaCancha = (jornada.participantes || []).filter(
    (p) => !Object.values(jornada.grupos || {}).some((jugadores) => jugadores.includes(p))
  );

  const handleArmarPorRanking = async () => {
    if (Object.keys(jornada.grupos || {}).length > 0) {
      if (!confirm("Ya hay canchas armadas para esta jornada. ¿Reemplazarlas según el ranking actual?")) return;
    }
    setArmando(true);
    try {
      const { canchasArmadas, sinCancha } = await armarCanchasPorRanking(jornada, jornadas, ajustes);
      showToast(
        sinCancha.length > 0
          ? `${canchasArmadas} cancha(s) armadas ✓ (${sinCancha.length} sin cancha por completar)`
          : `${canchasArmadas} cancha(s) armadas ✓`
      );
    } catch (err) {
      showToast("No se pudieron armar las canchas.", "error");
    }
    setArmando(false);
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

  const handleToggleInvitado = (nombre, esInvitado) => {
    toggleInvitado(jornada.id, nombre, esInvitado)
      .then(() => showToast(esInvitado ? "Ya no es invitado ✓" : "Marcado como invitado ✓"))
      .catch(() => showToast("No se pudo actualizar.", "error"));
  };

  const handleToggleTardanza = (nombre, esTarde) => {
    toggleTardanza(jornada.id, nombre, esTarde)
      .then(() => showToast(esTarde ? "Ya no llegó tarde ✓" : "Marcado como tarde ✓"))
      .catch(() => showToast("No se pudo actualizar.", "error"));
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
      <p className="text-[10px] mb-1.5" style={{ color: COLORS.limaSoft }}>
        Toca <Tag size={9} className="inline" /> invitado o <Clock size={9} className="inline" /> llegó tarde para
        marcarlo (afecta sus puntos).
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {(jornada.participantes || []).map((p) => {
          const esInvitado = (jornada.invitados || []).includes(p);
          const esTarde = (jornada.tardanzas || []).includes(p);
          return (
            <div
              key={p}
              className="pl-3 pr-1.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{ background: COLORS.cancha, color: COLORS.crema }}
            >
              <span>{p}</span>
              <button
                onClick={() => handleToggleInvitado(p, esInvitado)}
                title={esInvitado ? "Quitar marca de invitado" : "Marcar como invitado (no es miembro de la Liga)"}
              >
                <Tag size={12} color={esInvitado ? "#F5C242" : COLORS.limaSoft} fill={esInvitado ? "#F5C242" : "none"} />
              </button>
              <button
                onClick={() => handleToggleTardanza(p, esTarde)}
                title={esTarde ? "Quitar marca de tardanza" : "Marcar que llegó tarde (pierde el bono de asistencia)"}
              >
                <Clock size={12} color={esTarde ? "#F59E42" : COLORS.limaSoft} fill={esTarde ? "#F59E42" : "none"} />
              </button>
              <button onClick={() => handleQuitarParticipante(p)} title="Quitar">
                <span style={{ color: COLORS.limaSoft }}>×</span>
              </button>
            </div>
          );
        })}
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
          className="rounded-xl px-4 py-2 text-sm font-black transition-transform active:scale-95"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          Agregar
        </button>
      </form>

      {disponiblesParaCancha.length >= 4 && (
        <button
          onClick={handleArmarPorRanking}
          disabled={armando}
          title="Ordena a los participantes por ranking y arma canchas de 4 en 4"
          className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black mb-1 transition-transform active:scale-95"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          <Shuffle size={13} /> {armando ? "Armando…" : "Armar canchas automáticamente"}
        </button>
      )}

      {Object.keys(jornada.grupos || {}).length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.linea}` }}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.limaSoft }}>
            Canchas armadas (toca a alguien para quitarlo, o "+ nombre" para agregarlo)
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

function AjustesDePuntos({ ajustes, conocidos }) {
  const [jugador, setJugador] = useState("");
  const [puntos, setPuntos] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jugador.trim() || puntos === "") return;
    setGuardando(true);
    try {
      await crearAjuste(jugador.trim(), puntos, motivo.trim());
      setJugador("");
      setPuntos("");
      setMotivo("");
      showToast("Ajuste guardado ✓");
    } catch (err) {
      showToast("No se pudo guardar el ajuste.", "error");
    }
    setGuardando(false);
  };

  const handleEliminar = (ajuste) => {
    if (!confirm(`¿Borrar el ajuste de ${ajuste.puntos} pts a "${ajuste.jugador}"?`)) return;
    eliminarAjuste(ajuste.id)
      .then(() => showToast("Ajuste borrado ✓"))
      .catch(() => showToast("No se pudo borrar el ajuste.", "error"));
  };

  return (
    <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: COLORS.lima }}>
        Ajustes de puntos
      </p>
      <p className="text-[10px] mb-3" style={{ color: COLORS.limaSoft }}>
        Para casos que la app no decide sola: puntuación inicial de un jugador nuevo, cancelación el mismo día,
        exención de una penalización, etc.
      </p>

      {ajustes.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {ajustes.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: COLORS.cancha }}>
              <div className="text-xs">
                <span className="font-bold" style={{ color: COLORS.crema }}>
                  {a.jugador}
                </span>{" "}
                <span style={{ color: a.puntos >= 0 ? COLORS.lima : "#F5716B" }}>
                  {a.puntos >= 0 ? "+" : ""}
                  {a.puntos}
                </span>
                {a.motivo && <span style={{ color: COLORS.limaSoft }}> · {a.motivo}</span>}
              </div>
              <button onClick={() => handleEliminar(a)} title="Borrar ajuste">
                <Trash2 size={13} color="#F5716B" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            list="conocidos-ajustes"
            placeholder="Jugador"
            value={jugador}
            onChange={(e) => setJugador(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm font-medium flex-1"
            style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
          />
          <datalist id="conocidos-ajustes">
            {conocidos.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <input
            type="number"
            placeholder="Pts"
            value={puntos}
            onChange={(e) => setPuntos(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm font-mono font-bold w-20"
            style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
          />
        </div>
        <input
          type="text"
          placeholder="Motivo (ej. Puntuación inicial)"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <button
          type="submit"
          disabled={guardando}
          className="rounded-xl py-2.5 text-sm font-black transition-transform active:scale-95"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          {guardando ? "Guardando…" : "Agregar ajuste"}
        </button>
      </form>
    </div>
  );
}

export function AdminScreen({ jornadas, ajustes = [] }) {
  const conocidos = jugadoresConocidos(jornadas);
  const ordenadas = [...jornadas].sort((a, b) => b.orden - a.orden);
  const showToast = useToast();
  const archivoRef = useRef(null);

  const handleExportar = () => {
    try {
      exportarDatos(jornadas);
      showToast("Respaldo descargado ✓");
    } catch (err) {
      showToast("No se pudo generar el respaldo.", "error");
    }
  };

  const handleImportar = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo después
    if (!archivo) return;
    try {
      const texto = await archivo.text();
      const jornadasNuevas = JSON.parse(texto);
      if (!Array.isArray(jornadasNuevas)) throw new Error("Formato inválido");
      if (!confirm(`¿Agregar ${jornadasNuevas.length} jornada(s) del archivo? No se toca lo que ya existe.`)) return;
      const total = await importarDatos(jornadas, jornadasNuevas);
      showToast(`${total} jornada(s) importadas ✓`);
    } catch (err) {
      showToast("No se pudo importar el archivo.", "error");
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => archivoRef.current?.click()}
            title="Agregar jornadas desde un archivo .json"
            className="flex items-center gap-1 text-[11px] font-bold underline"
            style={{ color: COLORS.lima }}
          >
            <Upload size={13} /> Importar
          </button>
          <input ref={archivoRef} type="file" accept="application/json" className="hidden" onChange={handleImportar} />
          <button
            onClick={handleExportar}
            title="Descargar respaldo en JSON"
            className="flex items-center gap-1 text-[11px] font-bold underline"
            style={{ color: COLORS.lima }}
          >
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      <NuevaJornadaForm jornadas={jornadas} />

      <AjustesDePuntos ajustes={ajustes} conocidos={conocidos} />

      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:items-start">
        {ordenadas.map((j) => (
          <JornadaAdminCard key={j.id} jornada={j} conocidos={conocidos} jornadas={jornadas} ajustes={ajustes} />
        ))}
      </div>
    </div>
  );
}
