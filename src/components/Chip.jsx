import { COLORS } from "../colors";

export function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
      style={{
        background: active ? COLORS.lima : "transparent",
        color: active ? COLORS.tinta : COLORS.crema,
        border: `1.5px solid ${active ? COLORS.lima : COLORS.linea}`,
      }}
    >
      {children}
    </button>
  );
}
