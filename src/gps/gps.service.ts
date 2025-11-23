// src/gps/gps.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateGpsReportDto } from "./dto/create-gps-report.dto";
import { GpsHistoryQueryDto } from "./dto/gps-history-query.dto";

type GpsUltimoRow = {
  gps_id: number;
  unidad_id: number;
  latitud: number;
  longitud: number;
  velocidad: number | null;
  fecha_registro: Date;
  unidadNombre: string | null;
  placa: string | null;
};

@Injectable()
export class GpsService {
  constructor(private prisma: PrismaService) {}

  // ======================================================
  // 🟢 GUARDAR REPORTE GPS
  // ======================================================
  async createReport(dto: CreateGpsReportDto) {
    return await this.prisma.gps.create({
      data: {
        unidad_id: dto.unidad_id,
        latitud: dto.latitud,
        longitud: dto.longitud,
        velocidad: dto.velocidad ?? 0,
        ultima_geocerca_id: dto.ultima_geocerca_id ?? null,
      },
    });
  }

  // ======================================================
  // 🟦 OBTENER ÚLTIMOS GPS SOLO DE UNIDADES CON JORNADA ACTIVA
  // ======================================================
  async getUltimos(unidadId?: number): Promise<GpsUltimoRow[]> {
    const filtroUnidad = unidadId ? `AND g.unidad_id = ${Number(unidadId)}` : "";

    const sql = `
      SELECT DISTINCT ON (g.unidad_id)
        g.gps_id,
        g.unidad_id,
        g.latitud,
        g.longitud,
        g.velocidad,
        g.fecha_registro,
        u.nombre AS "unidadNombre",
        u.placa  AS "placa"
      FROM gps g
      JOIN unidades u ON u.unidad_id = g.unidad_id
      WHERE 1=1
        ${filtroUnidad}
      ORDER BY g.unidad_id, g.fecha_registro DESC;
    `;

    const gpsRows = await this.prisma.$queryRawUnsafe<GpsUltimoRow[]>(sql);

    // Filtrar únicamente unidades con jornada activa
    const jornadas = await this.prisma.jornada.findMany({
      where: {
        fin_jornada: null,
        horometro_fin: null,
        ...(unidadId ? { unidad_id: unidadId } : {}),
      },
      select: { unidad_id: true },
    });

    const activas = new Set(jornadas.map((j) => j.unidad_id));

    if (activas.size === 0) return [];

    return gpsRows.filter((row) => activas.has(row.unidad_id));
  }

  // ======================================================
  // 📜 HISTORIAL GPS
  // ======================================================
  async getHistory(query: GpsHistoryQueryDto) {
    return this.prisma.gps.findMany({
      where: {
        unidad_id: query.unidadId ? Number(query.unidadId) : undefined,
        fecha_registro: {
          gte: query.desde ? new Date(query.desde) : undefined,
          lte: query.hasta ? new Date(query.hasta) : undefined,
        },
      },
      orderBy: { fecha_registro: "desc" },
      take: query.limit ? Number(query.limit) : 500,
    });
  }
}
