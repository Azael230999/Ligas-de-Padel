import { lazy, Suspense, useEffect, useState } from "react";
import { Users, Trophy, CircleDot, Settings } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { watchAjustes, watchJornadas } from "./data";
import { COLORS } from "./colors";
import { PelotaIcon } from "./components/PelotaIcon";
import { PrincipalScreen } from "./screens/PrincipalScreen";
import { ToastProvider } from "./toast";

// Estas pantallas no hacen falta en la primera carga (solo se ven al
// cambiar de pestaña o iniciar sesión), así que se separan en su propio
// chunk para no engordar el bundle inicial.
const RankingScreen = lazy(() => import("./screens/RankingScreen").then((m) => ({ default: m.RankingScreen })));
const PelotasScreen = lazy(() => import("./screens/PelotasScreen").then((m) => ({ default: m.PelotasScreen })));
const LoginScreen = lazy(() => import("./screens/LoginScreen").then((m) => ({ default: m.LoginScreen })));
const AdminScreen = lazy(() => import("./screens/AdminScreen").then((m) => ({ default: m.AdminScreen })));

function CargandoPantalla() {
  return (
    <div className="px-5 pt-6">
      <p className="text-sm" style={{ color: COLORS.limaSoft }}>
        Cargando…
      </p>
    </div>
  );
}

const TABS = [
  { id: "principal", label: "Principal", icon: Users },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "pelotas", label: "Pelotas", icon: CircleDot },
];

const ADMIN_TAB = { id: "admin", label: "Admin", icon: Settings };

export default function App() {
  const [tab, setTab] = useState("principal");
  const [jornadas, setJornadas] = useState([]);
  const [ajustes, setAjustes] = useState([]);
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

  useEffect(() => watchAjustes(setAjustes, () => {}), []);

  useEffect(() => onAuthStateChanged(auth, (user) => setAdmin(!!user)), []);

  useEffect(() => {
    if (!admin && tab === "admin") setTab("principal");
  }, [admin, tab]);

  const tabs = admin ? [...TABS, ADMIN_TAB] : TABS;

  return (
    <div className="w-full min-h-screen flex justify-center" style={{ background: "#0A2422" }}>
      <div
        className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl min-h-screen relative"
        style={{ background: COLORS.cancha, fontFamily: "'Inter', system-ui, sans-serif" }}
      >
      <ToastProvider>
        <div
          className="px-5 md:px-10 pb-2 flex items-center justify-between"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 2rem)" }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: COLORS.lima }}>
              Country Pádel
            </p>
            <h1 className="font-black text-2xl -mt-0.5" style={{ color: COLORS.crema }}>
              Liga 1RA
            </h1>
          </div>
          <PelotaIcon size={36} />
        </div>

        <div className="flex justify-end px-5 md:px-10 mb-3 -mt-1.5">
          {admin ? (
            <button
              onClick={() => signOut(auth)}
              className="text-[10.5px] font-semibold"
              style={{ color: COLORS.limaSoft, opacity: 0.8 }}
            >
              Salir
            </button>
          ) : (
            <button
              onClick={() => setMostrarLogin(true)}
              className="text-[10.5px] font-semibold"
              style={{ color: COLORS.limaSoft, opacity: 0.8 }}
            >
              Entrar como admin
            </button>
          )}
        </div>

        <div style={{ minHeight: "70vh" }}>
          <Suspense fallback={<CargandoPantalla />}>
            {mostrarLogin ? (
              <LoginScreen onCancel={() => setMostrarLogin(false)} />
            ) : cargando ? (
              <CargandoPantalla />
            ) : (
              <div key={tab} className="animar-tab">
                {tab === "principal" && <PrincipalScreen jornadas={jornadas} admin={admin} />}
                {tab === "ranking" && <RankingScreen jornadas={jornadas} ajustes={ajustes} />}
                {tab === "pelotas" && <PelotasScreen jornadas={jornadas} admin={admin} />}
                {tab === "admin" && admin && <AdminScreen jornadas={jornadas} ajustes={ajustes} />}
              </div>
            )}
          </Suspense>
        </div>

        <div
          className="fixed bottom-0 w-full max-w-sm md:max-w-2xl lg:max-w-4xl flex items-stretch"
          style={{
            background: COLORS.canchaAlt,
            borderTop: `1px solid ${COLORS.linea}`,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
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
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-transform active:scale-95"
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
