/*
  Warnings:

  - Added the required column `usuario_id` to the `servicios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
