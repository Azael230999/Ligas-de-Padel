"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calcularBalancePelotas, sugerirAsignados } from "@/lib/data";
import { READ_ONLY } from "@/lib/readonly";

export async function toggleAsignacionPelotas(formData: FormData) {
  if (READ_ONLY) throw new Error("Esta versión es de solo lectura.");
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
  if (READ_ONLY) throw new Error("Esta versión es de solo lectura.");
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
  if (READ_ONLY) throw new Error("Esta versión es de solo lectura.");
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
