import { login } from "@/app/actions";
import { COLORS } from "@/lib/colors";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="px-5 pt-10 pb-24 flex flex-col items-center">
      <h1 className="font-black text-xl mb-1" style={{ color: COLORS.crema }}>
        Entrar como admin
      </h1>
      <p className="text-xs mb-6 text-center" style={{ color: COLORS.limaSoft }}>
        Con la contraseña puedes capturar resultados y asignar el rol de pelotas.
      </p>

      <form action={login} className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          autoFocus
          className="rounded-xl px-3 py-2.5 text-sm font-medium"
          style={{ background: COLORS.canchaAlt, color: COLORS.crema, border: `1px solid ${COLORS.linea}` }}
        />
        {error && (
          <p className="text-xs font-bold" style={{ color: "#F5716B" }}>
            Contraseña incorrecta.
          </p>
        )}
        <button
          type="submit"
          className="rounded-xl py-2.5 text-sm font-black"
          style={{ background: COLORS.lima, color: COLORS.tinta }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
