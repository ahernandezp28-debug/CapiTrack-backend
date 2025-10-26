-- CreateTable
CREATE TABLE "geocercas" (
    "geocerca_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "radio_metros" DOUBLE PRECISION NOT NULL,
    "tipo_evento" TEXT NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "geocercas_pkey" PRIMARY KEY ("geocerca_id")
);

-- AddForeignKey
ALTER TABLE "geocercas" ADD CONSTRAINT "geocercas_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;
