// src/gps/gps.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateGpsReportDto } from "./dto/create-gps-report.dto";
import { GpsHistoryQueryDto } from "./dto/gps-history-query.dto";

type GpsUltimoRowRaw = {
  gps_id: number;
  unidad_id: number;
  latitud: any;
  longitud: any;
  velocidad: any;
  fecha_registro: any;
  unidadNombre: string | null;
  placa: string | null;
};

type GpsUltimoRow = {
  gps_id: number;
  unidad_id: number;
  latitud: number;
  longitud: number;
  velocidad: number | null;
  fecha_registro: string; // ISO string
  unidadNombre: string | null;
  placa: string | null;
};

@Injectable()
export class GpsService {
  constructor(private prisma: PrismaService) {}

  // Guardar reporte GPS (usa el modelo prisma 'gps')
  async createReport(dto: CreateGpsReportDto) {
    return this.prisma.gps.create({
      data: {
        unidad_id: dto.unidad_id,
        latitud: dto.latitud,
        longitud: dto.longitud,
        velocidad: dto.velocidad ?? 0,
        ultima_geocerca_id: dto.ultima_geocerca_id ?? null,
      },
    });
  }

  // ----------------------
  // Helper: convertir cualquier valor a ISO string de forma segura
  // ----------------------
  private toIsoDateString(v: any): string {
    try {
      if (v == null) return new Date().toISOString();

      // Si ya es Date válido
      if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();

      // Si es número (epoch en seg o ms)
      if (typeof v === "number") {
        const maybeMs = v < 1e12 ? v * 1000 : v;
        const d = new Date(maybeMs);
        if (!isNaN(d.getTime())) return d.toISOString();
      }

      // Si es string, intentar varios formatos
      if (typeof v === "string") {
        const s = v.trim();

        // Caso: DD/MM/YYYY[ HH:MM:SS]
        const dm = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}:\d{2}:\d{2}))?/);
        if (dm) {
          const day = dm[1], month = dm[2], year = dm[3], time = dm[4] ?? "00:00:00";
          const iso = `${year}-${month}-${day}T${time}Z`;
          const d = new Date(iso);
          if (!isNaN(d.getTime())) return d.toISOString();
        }

        // Caso: ISO-like o YYYY-MM-DD...
        const d2 = new Date(s);
        if (!isNaN(d2.getTime())) return d2.toISOString();

        // Caso: string numérico epoch
        if (/^\d+$/.test(s)) {
          const n = Number(s);
          const maybeMs = n < 1e12 ? n * 1000 : n;
          const d3 = new Date(maybeMs);
          if (!isNaN(d3.getTime())) return d3.toISOString();
        }
      }

      // Fallback: now
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Obtener últimos GPS (ultimo registro por unidad).
   * Devuelve solo unidades que actualmente tienen jornada activa (fin_jornada IS NULL).
   * Si unidadId se pasa, filtra por esa unidad.
   */
  async getUltimos(unidadId?: number): Promise<GpsUltimoRow[]> {
    // 1) Obtener unidades en jornada activa (si no hay, devolver arreglo vacío)
    const jornadas = await this.prisma.jornada.findMany({
      where: {
        fin_jornada: null,
        ...(unidadId ? { unidad_id: unidadId } : {}),
      },
      select: { unidad_id: true },
    });

    const activas = jornadas.map((j) => j.unidad_id);
    if (activas.length === 0) return [];

    // 2) Consultar solo los últimos registros de las unidades activas
    // Usamos DISTINCT ON (g.unidad_id) para obtener el último por unidad
    // y filtramos por las unidades activas.
    const inList = activas.join(",") || "NULL";

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
      WHERE g.unidad_id IN (${inList})
      ORDER BY g.unidad_id, g.fecha_registro DESC;
    `;

    const gpsRowsRaw = await this.prisma.$queryRawUnsafe<GpsUltimoRowRaw[]>(sql);

    // 3) Normalizar la respuesta: forzar numbers y fecha ISO
    const gpsRows: GpsUltimoRow[] = gpsRowsRaw.map((r) => {
      const lat = r.latitud != null ? Number(r.latitud) : 0;
      const lng = r.longitud != null ? Number(r.longitud) : 0;
      const vel = r.velocidad != null ? Number(r.velocidad) : 0;
      const fechaIso = this.toIsoDateString(r.fecha_registro);

      return {
        gps_id: Number(r.gps_id),
        unidad_id: Number(r.unidad_id),
        latitud: Number.isFinite(lat) ? lat : 0,
        longitud: Number.isFinite(lng) ? lng : 0,
        velocidad: Number.isFinite(vel) ? vel : 0,
        fecha_registro: fechaIso,
        unidadNombre: r.unidadNombre ?? null,
        placa: r.placa ?? null,
      };
    });

    return gpsRows;
  }

  // Historial GPS (por unidad y rango de fechas)
  async getHistory(query: GpsHistoryQueryDto) {
    const rows = await this.prisma.gps.findMany({
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

    // Normalizar output similar a getUltimos (ISO dates, numbers)
    return rows.map((r: any) => {
      const fechaIso = this.toIsoDateString(r.fecha_registro);
      return {
        gps_id: r.gps_id ?? r.id,
        unidad_id: r.unidad_id,
        latitud: r.latitud != null ? Number(r.latitud) : null,
        longitud: r.longitud != null ? Number(r.longitud) : null,
        velocidad: r.velocidad != null ? Number(r.velocidad) : 0,
        fecha_registro: fechaIso,
        unidadNombre: null,
        placa: r.placa ?? null,
      };
    });
  }
}

