/*
  Warnings:

  - You are about to drop the column `hora_fin` on the `jornadas` table. All the data in the column will be lost.
  - You are about to drop the column `hora_inicio` on the `jornadas` table. All the data in the column will be lost.
  - You are about to drop the column `horas_trabajo` on the `jornadas` table. All the data in the column will be lost.
  - You are about to drop the column `observacion` on the `jornadas` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `jornadas` table. All the data in the column will be lost.
  - Added the required column `costo_hora` to the `jornadas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operador_id` to the `jornadas` table without a default value. This is not possible if the table is not empty.
  - Made the column `proveedor_id` on table `unidades` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."jornadas" DROP CONSTRAINT "jornadas_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."unidades" DROP CONSTRAINT "unidades_proveedor_id_fkey";

-- DropIndex
DROP INDEX "public"."unidades_placa_key";

-- AlterTable
ALTER TABLE "jornadas" DROP COLUMN "hora_fin",
DROP COLUMN "hora_inicio",
DROP COLUMN "horas_trabajo",
DROP COLUMN "observacion",
DROP COLUMN "usuario_id",
ADD COLUMN     "costo_hora" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "fin_jornada" TIMESTAMP(3),
ADD COLUMN     "horometro_fin" DECIMAL(65,30),
ADD COLUMN     "horometro_inicio" DECIMAL(65,30),
ADD COLUMN     "inicio_jornada" TIMESTAMP(3),
ADD COLUMN     "operador_id" INTEGER NOT NULL,
ADD COLUMN     "total_horas" DECIMAL(65,30),
ADD COLUMN     "total_pagar" DECIMAL(65,30),
ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "unidades" ALTER COLUMN "proveedor_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("proveedor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
