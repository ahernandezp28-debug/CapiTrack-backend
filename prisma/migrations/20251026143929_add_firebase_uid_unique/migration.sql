/*
  Warnings:

  - A unique constraint covering the columns `[firebaseUid]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usuarios_firebaseUid_key" ON "usuarios"("firebaseUid");
