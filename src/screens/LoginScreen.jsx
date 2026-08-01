import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { COLORS } from "../colors";

export function LoginScreen({ onCancel }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onCancel();
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
    setLoading(false);
  };

  return (
    <div className="px-5 pt-10 pb-24 flex flex-col items-center">
      <h1 className="font-black text-xl mb-1" style={{ color: COLORS.crema }}>
        Entrar como admin
      </h1>
      <p className="text-xs mb-6 text-center" style={{ color: COLORS.limaSoft }}>
        Con tu cuenta puedes capturar resultados y asignar el rol de pelotas.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="email"
          placeholder="Correo"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm font-medium"
          style={{ background: COLORS.canchaAlt, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm font-medium"
          style={{ background: COLORS.canchaAlt, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        {error && (
          <p className="text-xs font-bold" style={{ color: "#F5716B" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl py-2.5 text-sm font-black"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold underline"
          style={{ color: COLORS.limaSoft }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
