// src/reporte/reporte.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JornadasReportQueryDto } from './dto/jornadas-report-query.dto';

@Injectable()
export class ReporteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reporte JSON de jornadas para el dashboard (admin)
   */
  async jornadasResumen(query: JornadasReportQueryDto) {
    const {
      desde,
      hasta,
      proveedor_id,
      unidad_id,
      tipo_unidad,
    } = query;

    // Asumimos que ValidationPipe ya dejó estos como number | undefined
    const proveedorId =
      typeof proveedor_id === 'number' ? proveedor_id : undefined;

    const unidadId =
      typeof unidad_id === 'number' ? unidad_id : undefined;

    const tipoUnidad = tipo_unidad
      ? String(tipo_unidad).toUpperCase()
      : undefined;

    const where: any = {};

    // 🗓️ Filtro por rango de fechas (campo Jornada.fecha)
    if (desde || hasta) {
      where.fecha = {};

      if (desde) {
        // 'desde' viene como string "YYYY-MM-DD" → new Date("YYYY-MM-DD")
        const d = new Date(desde as any);
        where.fecha.gte = d;
      }

      if (hasta) {
        // 'hasta' inclusive → sumamos 1 día y usamos < siguiente día
        const d = new Date(hasta as any);
        d.setDate(d.getDate() + 1);
        where.fecha.lt = d;
      }
    }

    if (unidadId) {
      where.unidad_id = unidadId;
    }

    // ⬇️ Obtenemos jornadas con unidad + proveedor + operador
    const jornadas = await this.prisma.jornada.findMany({
      where,
      include: {
        unidad: {
          include: {
            proveedor: true,
          },
        },
        operador: true,
      },
      orderBy: { fecha: 'desc' },
    });

    // Filtro en memoria por proveedor (solo si se envía)
    const filtradasProveedor = proveedorId
      ? jornadas.filter((j) => j.unidad.proveedor_id === proveedorId)
      : jornadas;

    // Filtro por tipo de unidad (CAMION / MAQUINARIA) en memoria
    const filtradasTipo = tipoUnidad
      ? filtradasProveedor.filter(
          (j) => j.unidad.tipo.toUpperCase() === tipoUnidad,
        )
      : filtradasProveedor;

    // Mapeo a la forma que consumirá el frontend
    return filtradasTipo.map((j) => ({
      jornada_id: j.jornada_id,
      fecha: j.fecha,
      unidad_id: j.unidad_id,
      unidad_nombre: j.unidad.nombre,
      placa: j.unidad.placa,
      tipo_unidad: j.unidad.tipo,
      operador_id: j.operador_id,
      operador_nombre: j.operador?.nombre ?? null,
      proveedor_id: j.unidad.proveedor_id ?? null,
      proveedor_nombre: j.unidad.proveedor?.nombre ?? null,
      inicio_jornada: j.inicio_jornada,
      fin_jornada: j.fin_jornada,
      horometro_inicio: j.horometro_inicio,
      horometro_fin: j.horometro_fin,
      total_horas: j.total_horas,
      costo_hora: j.costo_hora,
      total_pagar: j.total_pagar,
    }));
  }

  /**
   * Exportar las mismas jornadas a Excel.
   * Aquí solo dejo la firma lista para que metas tu lógica de exceljs.
   */
  async exportJornadasExcel(query: JornadasReportQueryDto): Promise<Buffer> {
    const rows = await this.jornadasResumen(query);

    // 👇 Aquí va tu implementación real con exceljs u otra librería.
    // Por ahora, solo devolvemos un Buffer vacío para que compile.
    return Buffer.from([]);
  }
}
