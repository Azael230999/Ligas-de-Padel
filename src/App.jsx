import { useEffect, useState } from "react";
import { Users, Trophy, CircleDot, Settings } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { watchJornadas } from "./data";
import { COLORS } from "./colors";
import { PrincipalScreen } from "./screens/PrincipalScreen";
import { RankingScreen } from "./screens/RankingScreen";
import { PelotasScreen } from "./screens/PelotasScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { AdminScreen } from "./screens/AdminScreen";
import { ToastProvider } from "./toast";

const TABS = [
  { id: "principal", label: "Principal", icon: Users },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "pelotas", label: "Pelotas", icon: CircleDot },
];

const ADMIN_TAB = { id: "admin", label: "Admin", icon: Settings };

export default function App() {
  const [tab, setTab] = useState("principal");
  const [jornadas, setJornadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);

  useEffect(() => {
    const unsub = watchJornadas(
      (docs) => {
        setJornadas(docs);
        setCargando(false);
      },
      () => setCargando(false)
    );
    return unsub;
  }, []);

  useEffect(() => onAuthStateChanged(auth, (user) => setAdmin(!!user)), []);

  useEffect(() => {
    if (!admin && tab === "admin") setTab("principal");
  }, [admin, tab]);

  const tabs = admin ? [...TABS, ADMIN_TAB] : TABS;

  return (
    <div className="w-full min-h-screen flex justify-center" style={{ background: "#0A2422" }}>
      <div
        className="w-full max-w-sm min-h-screen relative"
        style={{ background: COLORS.cancha, fontFamily: "'Inter', system-ui, sans-serif" }}
      >
      <ToastProvider>
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

        <div
          className="mx-5 mb-2 rounded-lg px-3 py-1.5 flex items-center justify-between"
          style={{ background: COLORS.canchaAlt }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.limaSoft }}>
            {admin ? "Modo admin" : "Solo lectura"}
          </span>
          {admin ? (
            <button
              onClick={() => signOut(auth)}
              className="text-[10px] font-bold underline"
              style={{ color: COLORS.lima }}
            >
              Salir
            </button>
          ) : (
            <button
              onClick={() => setMostrarLogin(true)}
              className="text-[10px] font-bold underline"
              style={{ color: COLORS.lima }}
            >
              Entrar como admin
            </button>
          )}
        </div>

        <div style={{ minHeight: "70vh" }}>
          {mostrarLogin ? (
            <LoginScreen onCancel={() => setMostrarLogin(false)} />
          ) : cargando ? (
            <div className="px-5 pt-6">
              <p className="text-sm" style={{ color: COLORS.limaSoft }}>
                Cargando…
              </p>
            </div>
          ) : (
            <>
              {tab === "principal" && <PrincipalScreen jornadas={jornadas} admin={admin} />}
              {tab === "ranking" && <RankingScreen jornadas={jornadas} />}
              {tab === "pelotas" && <PelotasScreen jornadas={jornadas} admin={admin} />}
              {tab === "admin" && admin && <AdminScreen jornadas={jornadas} />}
            </>
          )}
        </div>

        <div
          className="fixed bottom-0 w-full max-w-sm flex items-stretch"
          style={{ background: COLORS.canchaAlt, borderTop: `1px solid ${COLORS.linea}` }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id && !mostrarLogin;
            return (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setMostrarLogin(false);
                }}
                className="flex-1 flex flex-col items-center gap-1 py-3"
              >
                <Icon size={19} color={active ? COLORS.lima : COLORS.limaSoft} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-bold" style={{ color: active ? COLORS.lima : COLORS.limaSoft }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </ToastProvider>
      </div>
    </div>
  );
}
