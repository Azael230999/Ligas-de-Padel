import { COLORS } from "../colors";

export function Chip({ children, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
      style={{
        background: active ? COLORS.lima : "transparent",
        color: active ? COLORS.tinta : COLORS.crema,
        border: `1.5px solid ${active ? COLORS.lima : COLORS.linea}`,
      }}
    >
      {children}
      {badge && (
        <span
          className="absolute -top-1.5 -right-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded whitespace-nowrap"
          style={{ background: "#F5716B", color: COLORS.crema }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
