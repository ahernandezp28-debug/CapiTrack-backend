import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';

@Injectable()
export class IncidentesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIncidenteDto, dbUser: any) {
    const { rol_id, usuario_id } = dbUser;

    // Los operadores pueden reportar solo en sus unidades
    if (rol_id === 2) {
      // Aseguramos que la unidad sea del operador
      const unidad = await this.prisma.unidad.findUnique({
        where: { unidad_id: dto.unidad_id },
      });

      if (!unidad || unidad.usuario_operador_id !== usuario_id) {
        throw new ForbiddenException('No puede registrar incidentes en otras unidades');
      }
    }

    return this.prisma.incidente.create({
      data: {
        ...dto,
        usuario_id,
      },
    });
  }

  async findAll(dbUser: any) {
    const { rol_id, usuario_id, proveedor_id } = dbUser;

    if (rol_id === 1) {
      return this.prisma.incidente.findMany({
        include: { unidad: true, usuario: true },
      });
    }

    if (rol_id === 4) {
      return this.prisma.incidente.findMany({
        where: {
          unidad: {
            proveedor_id,
          },
        },
        include: { unidad: true, usuario: true },
      });
    }

    return this.prisma.incidente.findMany({
      where: { usuario_id },
      include: { unidad: true, usuario: true },
    });
  }

  async findOne(id: number, dbUser: any) {
    const incidente = await this.prisma.incidente.findUnique({
      where: { incidente_id: id },
      include: { unidad: true, usuario: true },
    });

    if (!incidente) throw new NotFoundException('Incidente no encontrado');

    const { rol_id, usuario_id, proveedor_id } = dbUser;

    if (rol_id === 1) return incidente;
    if (rol_id === 4 && incidente.unidad.proveedor_id === proveedor_id) return incidente;
    if (rol_id === 2 && incidente.usuario_id === usuario_id) return incidente;

    throw new ForbiddenException('Acceso denegado');
  }

  async update(id: number, dto: UpdateIncidenteDto, dbUser: any) {
    const incidente = await this.findOne(id, dbUser);
    return this.prisma.incidente.update({
      where: { incidente_id: id },
      data: dto,
    });
  }

  async remove(id: number, dbUser: any) {
    const incidente = await this.findOne(id, dbUser);

    if (dbUser.rol_id !== 1)
      throw new ForbiddenException('No tiene permisos para eliminar');

    return this.prisma.incidente.delete({
      where: { incidente_id: id },
    });
  }
}
