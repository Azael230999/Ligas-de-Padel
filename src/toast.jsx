import { createContext, useCallback, useContext, useRef, useState } from "react";
import { COLORS } from "./colors";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((mensaje, tipo = "ok") => {
    clearTimeout(timeoutRef.current);
    setToast({ mensaje, tipo });
    timeoutRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 px-4 py-2.5 rounded-xl text-sm font-bold text-center max-w-[85%]"
          style={{
            background: toast.tipo === "error" ? "#F5716B" : COLORS.lima,
            color: toast.tipo === "error" ? "#3A0E0C" : COLORS.tinta,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
        >
          {toast.mensaje}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
