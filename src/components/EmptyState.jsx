import { COLORS } from "../colors";
import { PelotaIcon } from "./PelotaIcon";

export function EmptyState({ mensaje, children }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10 gap-3">
      <PelotaIcon size={44} />
      <p className="text-sm" style={{ color: COLORS.limaSoft }}>
        {mensaje}
      </p>
      {children}
    </div>
  );
}
