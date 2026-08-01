"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Trophy, CircleDot } from "lucide-react";
import { COLORS } from "@/lib/colors";

const TABS = [
  { href: "/", label: "Principal", icon: Users },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/pelotas", label: "Pelotas", icon: CircleDot },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 w-full max-w-sm flex items-stretch"
      style={{ background: COLORS.canchaAlt, borderTop: `1px solid ${COLORS.linea}` }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3"
          >
            <Icon size={19} color={active ? COLORS.lima : COLORS.limaSoft} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-bold" style={{ color: active ? COLORS.lima : COLORS.limaSoft }}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
