-- CreateTable
CREATE TABLE "Jugador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Jornada" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "canchas" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "JornadaParticipante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jornadaId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    CONSTRAINT "JornadaParticipante_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JornadaParticipante_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jornadaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    CONSTRAINT "Grupo_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrupoJugador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grupoId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    CONSTRAINT "GrupoJugador_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GrupoJugador_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grupoId" INTEGER NOT NULL,
    "gamesPareja1" INTEGER NOT NULL,
    "gamesPareja2" INTEGER NOT NULL,
    CONSTRAINT "Partido_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PartidoJugador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partidoId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    "pareja" INTEGER NOT NULL,
    CONSTRAINT "PartidoJugador_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Partido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartidoJugador_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PelotasAsignacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jornadaId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    CONSTRAINT "PelotasAsignacion_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PelotasAsignacion_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Jugador_nombre_key" ON "Jugador"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Jornada_nombre_key" ON "Jornada"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Jornada_orden_key" ON "Jornada"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "JornadaParticipante_jornadaId_jugadorId_key" ON "JornadaParticipante"("jornadaId", "jugadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_jornadaId_nombre_key" ON "Grupo"("jornadaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoJugador_grupoId_jugadorId_key" ON "GrupoJugador"("grupoId", "jugadorId");

-- CreateIndex
CREATE UNIQUE INDEX "PartidoJugador_partidoId_jugadorId_key" ON "PartidoJugador"("partidoId", "jugadorId");

-- CreateIndex
CREATE UNIQUE INDEX "PelotasAsignacion_jornadaId_jugadorId_key" ON "PelotasAsignacion"("jornadaId", "jugadorId");
