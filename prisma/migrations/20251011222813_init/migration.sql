-- CreateTable
CREATE TABLE "proveedores" (
    "proveedor_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("proveedor_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "rol_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "unidad_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "placa" TEXT,
    "tipo_combustible" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "proveedor_id" INTEGER,
    "usuario_operador_id" INTEGER,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("unidad_id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "servicio_id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "unidad_id" INTEGER NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("servicio_id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "reporte_id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fin" TIMESTAMP(3) NOT NULL,
    "horas_trabajadas" DOUBLE PRECISION,
    "observaciones" TEXT,
    "unidad_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("reporte_id")
);

-- CreateTable
CREATE TABLE "combustibles" (
    "combustible_id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "costo_total" DOUBLE PRECISION,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unidad_id" INTEGER NOT NULL,

    CONSTRAINT "combustibles_pkey" PRIMARY KEY ("combustible_id")
);

-- CreateTable
CREATE TABLE "gps" (
    "gps_id" SERIAL NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "velocidad" DOUBLE PRECISION,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unidad_id" INTEGER NOT NULL,

    CONSTRAINT "gps_pkey" PRIMARY KEY ("gps_id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "alerta_id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL,
    "fecha_generada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unidad_id" INTEGER NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("alerta_id")
);

-- CreateTable
CREATE TABLE "jornadas" (
    "jornada_id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fin" TIMESTAMP(3) NOT NULL,
    "horas_trabajo" DOUBLE PRECISION,
    "observacion" TEXT,
    "unidad_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "jornadas_pkey" PRIMARY KEY ("jornada_id")
);

-- CreateTable
CREATE TABLE "incidentes" (
    "incidente_id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severidad" TEXT NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "incidentes_pkey" PRIMARY KEY ("incidente_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_placa_key" ON "unidades"("placa");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("proveedor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_usuario_operador_id_fkey" FOREIGN KEY ("usuario_operador_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combustibles" ADD CONSTRAINT "combustibles_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps" ADD CONSTRAINT "gps_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("unidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
