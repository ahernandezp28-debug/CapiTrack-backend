import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GpsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any, dbUser: any) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: dto.unidad_id },
    });

    if (!unidad) {
      throw new ForbiddenException('Unidad no válida');
    }

    const gps = await this.prisma.gps.create({
      data: {
        latitud: dto.latitud,
        longitud: dto.longitud,
        velocidad: dto.velocidad ?? 0,
        unidad_id: dto.unidad_id,
      },
    });

    await this.checkGeofence(dto.unidad_id, dto.latitud, dto.longitud);

    return gps;
  }

  private async checkGeofence(unidad_id: number, lat: number, lng: number) {
    const geocerca = await this.prisma.geocerca.findFirst({
      where: { unidad_id },
    });

    if (!geocerca) return;

    const distancia = this.haversine(lat, lng, geocerca.latitud, geocerca.longitud);
    const fuera = distancia > geocerca.radio_metros;

    if (fuera) {
      await this.prisma.alerta.create({
        data: {
          tipo: 'Salida de Geocerca',
          mensaje: `La unidad ${unidad_id} se salió del área permitida`,
          prioridad: 'Alta',
          unidad_id,
        },
      });

      console.log('🚨 ALERTA: Unidad fuera de la geocerca');
    }
  }

  private haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async findAllByUnidad(unidad_id: number, dbUser: any) {
    return this.prisma.gps.findMany({
      where: { unidad_id },
      orderBy: { fecha_registro: 'desc' },
      take: 200,
    });
  }

  async ultimaPosicion(unidad_id: number, dbUser: any) {
    return this.prisma.gps.findFirst({
      where: { unidad_id },
      orderBy: { fecha_registro: 'desc' },
    });
  }

  async ruta(unidad_id: number, limite: number = 20, dbUser: any) {
    return this.prisma.gps.findMany({
      where: { unidad_id },
      orderBy: { fecha_registro: 'desc' },
      take: limite,
    });
  }
}
