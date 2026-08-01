import Link from "next/link";
import { COLORS } from "@/lib/colors";

export function Chip({
  children,
  active,
  href,
}: {
  children: React.ReactNode;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
      style={{
        background: active ? COLORS.lima : "transparent",
        color: active ? COLORS.tinta : COLORS.crema,
        border: `1.5px solid ${active ? COLORS.lima : COLORS.linea}`,
      }}
    >
      {children}
    </Link>
  );
}
