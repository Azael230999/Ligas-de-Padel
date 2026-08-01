import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { COLORS } from "../colors";
import { editarResultado, eliminarResultado } from "../data";
import { useToast } from "../toast";

export function ResultadoRow({ jornadaId, grupoNombre, resultado, index, resultadosActuales, admin }) {
  const [editando, setEditando] = useState(false);
  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [guardando, setGuardando] = useState(false);
  const showToast = useToast();

  const empezarEdicion = () => {
    const [a, b] = resultado.marcador.split("/");
    setG1(a);
    setG2(b);
    setEditando(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (g1 === "" || g2 === "") return;
    setGuardando(true);
    try {
      await editarResultado(jornadaId, grupoNombre, resultadosActuales, index, {
        ...resultado,
        marcador: `${g1}/${g2}`,
      });
      setEditando(false);
      showToast("Resultado actualizado ✓");
    } catch (err) {
      showToast("No se pudo guardar el cambio.", "error");
    }
    setGuardando(false);
  };

  const eliminar = () => {
    if (!confirm("¿Borrar este resultado?")) return;
    eliminarResultado(jornadaId, grupoNombre, resultado)
      .then(() => showToast("Resultado borrado ✓"))
      .catch(() => showToast("No se pudo borrar.", "error"));
  };

  if (editando) {
    return (
      <form
        onSubmit={guardar}
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.lima}` }}
      >
        <div className="text-sm leading-snug flex-1" style={{ color: COLORS.crema }}>
          <p className="font-bold">{resultado.pareja1.join(", ")}</p>
          <p style={{ color: COLORS.limaSoft }}>vs</p>
          <p className="font-bold">{resultado.pareja2.join(", ")}</p>
        </div>
        <input
          type="number"
          min={0}
          required
          value={g1}
          onChange={(e) => setG1(e.target.value)}
          className="w-12 rounded-lg px-2 py-1.5 text-sm font-mono font-bold text-center"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <span style={{ color: COLORS.limaSoft }}>/</span>
        <input
          type="number"
          min={0}
          required
          value={g2}
          onChange={(e) => setG2(e.target.value)}
          className="w-12 rounded-lg px-2 py-1.5 text-sm font-mono font-bold text-center"
          style={{ background: COLORS.cancha, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <button
          type="submit"
          disabled={guardando}
          className="rounded-lg px-2.5 py-1.5 text-xs font-black"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          OK
        </button>
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="text-xs font-bold"
          style={{ color: COLORS.limaSoft }}
        >
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
      style={{ background: COLORS.canchaAlt, border: `1px solid ${COLORS.linea}` }}
    >
      <div className="text-sm leading-snug" style={{ color: COLORS.crema }}>
        <p>
          <span className="font-bold">{resultado.pareja1.join(", ")}</span>
        </p>
        <p style={{ color: COLORS.limaSoft }}>vs</p>
        <p>
          <span className="font-bold">{resultado.pareja2.join(", ")}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-base font-black font-mono" style={{ color: COLORS.lima }}>
          {resultado.marcador}
        </span>
        {admin && (
          <div className="flex items-center gap-2">
            <button onClick={empezarEdicion} title="Editar marcador">
              <Pencil size={14} color={COLORS.limaSoft} />
            </button>
            <button onClick={eliminar} title="Borrar resultado">
              <Trash2 size={14} color="#F5716B" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
