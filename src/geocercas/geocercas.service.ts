import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGeocercaDto } from './dto/create-geocerca.dto';
import { UpdateGeocercaDto } from './dto/update-geocerca.dto';

@Injectable()
export class GeocercasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGeocercaDto, dbUser: any) {
  if (dbUser.rol_id === 2)
    throw new ForbiddenException('Los operadores no pueden crear geocercas');

  return this.prisma.geocerca.create({
    data: {
      nombre: dto.nombre,
      unidad_id: dto.unidad_id,
      latitud: dto.latitud,
      longitud: dto.longitud,
      radio_metros: dto.radio_metros,
      tipo_evento: dto.tipo_evento,
    },
  });
}


  async findAll(dbUser: any) {
    if (dbUser.rol_id === 1) {
      return this.prisma.geocerca.findMany({ include: { unidad: true } });
    }

    if (dbUser.rol_id === 4) {
      return this.prisma.geocerca.findMany({
        include: { unidad: true },
        where: {
          unidad: { proveedor_id: dbUser.proveedor_id }
        }
      });
    }

    throw new ForbiddenException('Rol no autorizado');
  }

  async findOne(id: number, dbUser: any) {
    const geo = await this.prisma.geocerca.findUnique({
      where: { geocerca_id: id },
      include: { unidad: true },
    });

    if (!geo) throw new NotFoundException('Geocerca no encontrada');

    if (dbUser.rol_id === 1) return geo;
    if (dbUser.rol_id === 4 && geo.unidad.proveedor_id === dbUser.proveedor_id) return geo;

    throw new ForbiddenException('No tiene permisos');
  }

  async update(id: number, dto: UpdateGeocercaDto, dbUser: any) {
    if (dbUser.rol_id === 2)
      throw new ForbiddenException('Los operadores no pueden editar geocercas');

    return this.prisma.geocerca.update({
      where: { geocerca_id: id },
      data: dto,
    });
  }

  async remove(id: number, dbUser: any) {
    if (dbUser.rol_id !== 1)
      throw new ForbiddenException('Solo administradores pueden eliminar');

    return this.prisma.geocerca.delete({ where: { geocerca_id: id } });
  }
}
