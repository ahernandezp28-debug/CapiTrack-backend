// src/gps/gps.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateGpsReportDto } from "./dto/create-gps-report.dto";
import { GpsHistoryQueryDto } from "./dto/gps-history-query.dto";

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(dto: CreateGpsReportDto) {
    // Opcional: podrías validar que la unidad existe antes
    // await this.prisma.unidad.findUnique({ where: { unidad_id: dto.unidad_id } });

    return this.prisma.gps.create({
      data: {
        latitud: dto.latitud,
        longitud: dto.longitud,
        velocidad: dto.velocidad,
        unidad_id: dto.unidad_id,
        ultima_geocerca_id: dto.ultima_geocerca_id ?? null,
      },
    });
  }

  /**
   * Última posición por unidad.
   * - Si se manda unidadId → solo esa unidad.
   * - Si no, todas las unidades (una fila por unidad).
   */
  async getUltimas(unidadId?: number) {
    if (unidadId) {
      const ultimo = await this.prisma.gps.findFirst({
        where: { unidad_id: unidadId },
        orderBy: { fecha_registro: "desc" },
      });
      return ultimo ? [ultimo] : [];
    }

    // Todas las filas ordenadas por unidad_id y fecha desc
    const all = await this.prisma.gps.findMany({
      orderBy: [{ unidad_id: "asc" }, { fecha_registro: "desc" }],
    });

    // Nos quedamos con la primera fila de cada unidad
    const map = new Map<number, any>();
    for (const row of all) {
      if (!map.has(row.unidad_id)) {
        map.set(row.unidad_id, row);
      }
    }

    return Array.from(map.values());
  }

  /**
   * Historial de una unidad (por rango de fechas).
   */
  async getHistory(query: GpsHistoryQueryDto) {
    const { unidadId, desde, hasta, limit } = query;

    const where: any = {
      unidad_id: unidadId,
    };

    if (desde || hasta) {
      where.fecha_registro = {};
      if (desde) where.fecha_registro.gte = new Date(desde);
      if (hasta) where.fecha_registro.lte = new Date(hasta);
    }

    return this.prisma.gps.findMany({
      where,
      orderBy: { fecha_registro: "asc" },
      take: limit ?? 500,
    });
  }
}
