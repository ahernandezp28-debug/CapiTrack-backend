// src/reporte/reporte.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JornadasReportQueryDto } from './dto/jornadas-report-query.dto';
import * as ExcelJS from 'exceljs';

/**
 * Tipo que cubre el Decimal de Prisma (tiene .toNumber())
 * Puede ser number (si Prisma lo mapeó) o el objeto Decimal de Prisma.
 */
type MaybeDecimal = { toNumber: () => number } | number | null | undefined;

/**
 * Tipo "raw" que refleja lo que devuelve Prisma: fechas como Date, campos numéricos
 * que potencialmente son Decimal, etc.
 */
export interface JornadaRawRow {
  jornada_id: number;
  fecha: Date;
  unidad_id: number;
  unidad_nombre: string;
  placa: string | null;
  tipo_unidad: string;
  operador_id: number | null;
  operador_nombre: string | null;
  proveedor_id: number | null;
  proveedor_nombre: string | null;
  inicio_jornada: Date | null;
  fin_jornada: Date | null;
  horometro_inicio: MaybeDecimal;
  horometro_fin: MaybeDecimal;
  total_horas: MaybeDecimal;
  costo_hora: MaybeDecimal;
  total_pagar: MaybeDecimal;
}

@Injectable()
export class ReporteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reporte JSON de jornadas para el dashboard (admin)
   * Devuelve datos sin convertir (fechas como Date, Decimal como objeto).
   */
  async jornadasResumen(
    query: JornadasReportQueryDto,
  ): Promise<JornadaRawRow[]> {
    const {
      desde,
      hasta,
      proveedor_id,
      unidad_id,
      tipo_unidad,
    } = query;

    const proveedorId =
      typeof proveedor_id === 'number' ? proveedor_id : undefined;

    const unidadId = typeof unidad_id === 'number' ? unidad_id : undefined;

    const tipoUnidad = tipo_unidad ? String(tipo_unidad).toUpperCase() : undefined;

    const where: any = {};

    // Filtro por rango de fechas
    if (desde || hasta) {
      where.fecha = {};
      if (desde) {
        where.fecha.gte = new Date(desde as any);
      }
      if (hasta) {
        const d = new Date(hasta as any);
        d.setDate(d.getDate() + 1);
        where.fecha.lt = d;
      }
    }

    if (unidadId) {
      where.unidad_id = unidadId;
    }

    const jornadas = await this.prisma.jornada.findMany({
      where,
      include: {
        unidad: { include: { proveedor: true } },
        operador: true,
      },
      orderBy: { fecha: 'desc' },
    });

    // Filtrar por proveedor en memoria (si aplica)
    const filtradasProveedor = proveedorId
      ? jornadas.filter((j) => j.unidad.proveedor_id === proveedorId)
      : jornadas;

    // Filtrar por tipo de unidad en memoria (si aplica)
    const filtradasTipo = tipoUnidad
      ? filtradasProveedor.filter((j) => j.unidad.tipo.toUpperCase() === tipoUnidad)
      : filtradasProveedor;

    // Mapear al tipo JornadaRawRow (manteniendo Date y Decimal-like)
    return filtradasTipo.map((j) => ({
      jornada_id: j.jornada_id,
      fecha: j.fecha,
      unidad_id: j.unidad_id,
      unidad_nombre: j.unidad.nombre,
      placa: j.unidad.placa,
      tipo_unidad: j.unidad.tipo,
      operador_id: j.operador_id ?? null,
      operador_nombre: j.operador?.nombre ?? null,
      proveedor_id: j.unidad.proveedor_id ?? null,
      proveedor_nombre: j.unidad.proveedor?.nombre ?? null,
      inicio_jornada: j.inicio_jornada ?? null,
      fin_jornada: j.fin_jornada ?? null,
      horometro_inicio: (j as any).horometro_inicio ?? null,
      horometro_fin: (j as any).horometro_fin ?? null,
      total_horas: (j as any).total_horas ?? null,
      costo_hora: (j as any).costo_hora ?? null,
      total_pagar: (j as any).total_pagar ?? null,
    }));
  }

  /**
   * Exporta las jornadas a Excel (convierte fechas y Decimal a valores primitivos)
   */
  async exportJornadasExcel(query: JornadasReportQueryDto): Promise<Buffer> {
    const rows = await this.jornadasResumen(query);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'CapiTrack';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Jornadas');

      // Columnas
      sheet.columns = [
        { header: 'Jornada ID', key: 'jornada_id', width: 12 },
        { header: 'Fecha', key: 'fecha', width: 18 },
        { header: 'Unidad ID', key: 'unidad_id', width: 12 },
        { header: 'Unidad', key: 'unidad_nombre', width: 25 },
        { header: 'Placa', key: 'placa', width: 12 },
        { header: 'Tipo', key: 'tipo_unidad', width: 14 },
        { header: 'Operador ID', key: 'operador_id', width: 12 },
        { header: 'Operador', key: 'operador_nombre', width: 22 },
        { header: 'Proveedor ID', key: 'proveedor_id', width: 12 },
        { header: 'Proveedor', key: 'proveedor_nombre', width: 22 },
        { header: 'Inicio Jornada', key: 'inicio_jornada', width: 20 },
        { header: 'Fin Jornada', key: 'fin_jornada', width: 20 },
        { header: 'Horómetro Inicio', key: 'horometro_inicio', width: 16 },
        { header: 'Horómetro Fin', key: 'horometro_fin', width: 14 },
        { header: 'Total Horas', key: 'total_horas', width: 12 },
        { header: 'Costo Hora', key: 'costo_hora', width: 12 },
        { header: 'Total Pagar', key: 'total_pagar', width: 14 },
      ];

      // Estilo cabecera (usando non-null assertion en eachCell)
      sheet.getRow(1).eachCell!((cell: ExcelJS.Cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
      });

      // Helper para convertir MaybeDecimal a number | null
      const decimalToNumber = (v: MaybeDecimal): number | null => {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') return v;
        if (typeof v === 'object' && typeof (v as any).toNumber === 'function') {
          try {
            return (v as any).toNumber();
          } catch {
            // fallback: intentar parsear
            const asStr = String(v);
            const n = Number(asStr);
            return Number.isNaN(n) ? null : n;
          }
        }
        const n = Number(v as any);
        return Number.isNaN(n) ? null : n;
      };

      // Helper para formatear fechas
      const formatDateSimple = (d: Date): string =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const formatDateTime = (d: Date): string =>
        `${formatDateSimple(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

      // Insertar filas con conversión de Decimals
      rows.forEach((r) => {
        const fechaStr = r.fecha ? formatDateSimple(r.fecha) : '';
        const inicioStr = r.inicio_jornada ? formatDateTime(r.inicio_jornada) : '';
        const finStr = r.fin_jornada ? formatDateTime(r.fin_jornada) : '';

        const horometroInicioNum = decimalToNumber(r.horometro_inicio);
        const horometroFinNum = decimalToNumber(r.horometro_fin);
        const totalHorasNum = decimalToNumber(r.total_horas);
        const costoNum = decimalToNumber(r.costo_hora);
        const totalNum = decimalToNumber(r.total_pagar);

        sheet.addRow({
          jornada_id: r.jornada_id,
          fecha: fechaStr,
          unidad_id: r.unidad_id,
          unidad_nombre: r.unidad_nombre,
          placa: r.placa ?? '',
          tipo_unidad: r.tipo_unidad,
          operador_id: r.operador_id ?? '',
          operador_nombre: r.operador_nombre ?? '',
          proveedor_id: r.proveedor_id ?? '',
          proveedor_nombre: r.proveedor_nombre ?? '',
          inicio_jornada: inicioStr,
          fin_jornada: finStr,
          horometro_inicio: horometroInicioNum ?? '',
          horometro_fin: horometroFinNum ?? '',
          total_horas: totalHorasNum ?? '',
          costo_hora: costoNum ?? '',
          total_pagar: totalNum ?? '',
        });
      });

      // Formatos numéricos (si quieres que Excel los interprete)
      try {
        const totalHorasCol = sheet.getColumn('total_horas');
        totalHorasCol.numFmt = '0.00';

        const costoCol = sheet.getColumn('costo_hora');
        costoCol.numFmt = '#,##0.00';

        const totalPagarCol = sheet.getColumn('total_pagar');
        totalPagarCol.numFmt = '#,##0.00';
      } catch (e) {
        // no crítico
      }

      // Ajuste sencillo de ancho basado en contenido (usando eachCell! también)
      sheet.columns.forEach((col) => {
        let maxLength = 10;
        // eachCell puede aparecer opcional en los tipos, forzamos con '!'
        (col as ExcelJS.Column).eachCell!({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
          const val = cell.value ?? '';
          const str =
            typeof val === 'object' && (val as any).text ? (val as any).text : String(val);
          if (str.length > maxLength) maxLength = str.length;
        });
        col.width = Math.min(Math.max(col.width ?? 10, maxLength + 2), 60);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const buf = Buffer.from(buffer);

      console.log('exportJornadasExcel: generated buffer size =', buf.byteLength);

      return buf;
    } catch (err) {
      console.error('Error generando Excel:', err);
      throw new InternalServerErrorException('No se pudo generar el archivo Excel');
    }
  }
}

/** Helpers de formato (tipados) */
function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
