import type { Metadata } from "next";
import Link from "next/link";
import { COLORS } from "@/lib/colors";
import { TabBar } from "@/components/TabBar";
import { isAdmin } from "@/lib/auth";
import { logout } from "@/app/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Country Pádel · Jornadas",
  description: "Seguimiento de jornadas, ranking y rol de pelotas de la liga de pádel.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await isAdmin();

  return (
    <html lang="es">
      <body className="antialiased">
        <div className="w-full min-h-screen flex justify-center" style={{ background: "#0A2422" }}>
          <div
            className="w-full max-w-sm min-h-screen relative"
            style={{ background: COLORS.cancha, fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            <div className="px-5 pt-8 pb-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: COLORS.lima }}>
                  Country Pádel
                </p>
                <h1 className="font-black text-2xl -mt-0.5" style={{ color: COLORS.crema }}>
                  Jornadas
                </h1>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: COLORS.lima, color: COLORS.tinta }}
              >
                J
              </div>
            </div>

            <div className="mx-5 mb-2 rounded-lg px-3 py-1.5 flex items-center justify-between" style={{ background: COLORS.canchaAlt }}>
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.limaSoft }}>
                {admin ? "Modo admin" : "Solo lectura"}
              </span>
              {admin ? (
                <form action={logout}>
                  <button type="submit" className="text-[10px] font-bold underline" style={{ color: COLORS.lima }}>
                    Salir
                  </button>
                </form>
              ) : (
                <Link href="/login" className="text-[10px] font-bold underline" style={{ color: COLORS.lima }}>
                  Entrar como admin
                </Link>
              )}
            </div>

            <div style={{ minHeight: "70vh" }}>{children}</div>

            <TabBar />
          </div>
        </div>
      </body>
    </html>
  );
}
