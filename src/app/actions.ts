"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calcularBalancePelotas, sugerirAsignados } from "@/lib/data";
import { ADMIN_COOKIE, isAdmin, tokenForPassword } from "@/lib/auth";
import { runSeed } from "@/lib/seedData";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Necesitas iniciar sesión como admin para hacer esto.");
}

export async function seedInitialData() {
  await requireAdmin();
  const existentes = await prisma.jugador.count();
  if (existentes > 0) throw new Error("La base ya tiene datos, no se vuelve a sembrar.");

  await runSeed(prisma);
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/pelotas");
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    redirect("/login?error=1");
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, tokenForPassword(adminPassword), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/");
}

export async function toggleAsignacionPelotas(formData: FormData) {
  await requireAdmin();
  const jornadaId = Number(formData.get("jornadaId"));
  const jugadorId = Number(formData.get("jugadorId"));

  const jornada = await prisma.jornada.findUniqueOrThrow({
    where: { id: jornadaId },
    include: { pelotas: true },
  });
  const yaAsignado = jornada.pelotas.some((p) => p.jugadorId === jugadorId);

  if (yaAsignado) {
    await prisma.pelotasAsignacion.deleteMany({ where: { jornadaId, jugadorId } });
  } else if (jornada.pelotas.length < jornada.canchas) {
    await prisma.pelotasAsignacion.create({ data: { jornadaId, jugadorId } });
  }

  revalidatePath("/pelotas");
}

export async function aplicarSugerenciaPelotas(formData: FormData) {
  await requireAdmin();
  const jornadaId = Number(formData.get("jornadaId"));

  const jornada = await prisma.jornada.findUniqueOrThrow({
    where: { id: jornadaId },
    include: { participantes: { include: { jugador: true } } },
  });
  const { conteo } = await calcularBalancePelotas();
  const sugeridos = sugerirAsignados(
    jornada.participantes.map((p) => p.jugador),
    jornada.canchas,
    conteo
  );

  await prisma.$transaction([
    prisma.pelotasAsignacion.deleteMany({ where: { jornadaId } }),
    prisma.pelotasAsignacion.createMany({
      data: sugeridos.map((j) => ({ jornadaId, jugadorId: j.id })),
    }),
  ]);

  revalidatePath("/pelotas");
}

export async function crearResultado(formData: FormData) {
  await requireAdmin();
  const grupoId = Number(formData.get("grupoId"));
  const rotacion = String(formData.get("rotacion") ?? "");
  const gamesPareja1 = Number(formData.get("gamesPareja1"));
  const gamesPareja2 = Number(formData.get("gamesPareja2"));

  const ids = rotacion.split("-").map(Number);
  if (
    Number.isNaN(grupoId) ||
    ids.length !== 4 ||
    ids.some((id) => Number.isNaN(id)) ||
    Number.isNaN(gamesPareja1) ||
    Number.isNaN(gamesPareja2)
  ) {
    throw new Error("Datos de resultado incompletos");
  }
  const [p1a, p1b, p2a, p2b] = ids;

  await prisma.partido.create({
    data: {
      grupoId,
      gamesPareja1,
      gamesPareja2,
      jugadores: {
        create: [
          { jugadorId: p1a, pareja: 1 },
          { jugadorId: p1b, pareja: 1 },
          { jugadorId: p2a, pareja: 2 },
          { jugadorId: p2b, pareja: 2 },
        ],
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/ranking");
}
