import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReporteDto, dbUser: any) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: dto.unidad_id },
    });

    if (!unidad) throw new NotFoundException('Unidad no encontrada');

    if (dbUser.rol_id === 2 && unidad.usuario_operador_id !== dbUser.usuario_id) {
      throw new ForbiddenException('No puede registrar reportes de otra unidad');
    }

    return this.prisma.reporte.create({
      data: {
        ...dto,
        usuario_id: dbUser.usuario_id,
      },
    });
  }

  async findAll(dbUser: any) {
    if (dbUser.rol_id === 1) {
      return this.prisma.reporte.findMany({ include: { usuario: true, unidad: true } });
    }

    if (dbUser.rol_id === 4) {
      return this.prisma.reporte.findMany({
        where: { unidad: { proveedor_id: dbUser.proveedor_id }},
        include: { usuario: true, unidad: true },
      });
    }

    return this.prisma.reporte.findMany({
      where: { usuario_id: dbUser.usuario_id },
      include: { usuario: true, unidad: true },
    });
  }

  async findOne(id: number, dbUser: any) {
    const reporte = await this.prisma.reporte.findUnique({
      where: { reporte_id: id },
      include: { usuario: true, unidad: true },
    });

    if (!reporte) throw new NotFoundException('Reporte no encontrado');

    if (dbUser.rol_id === 1) return reporte;

    if (dbUser.rol_id === 4 && reporte.unidad.proveedor_id === dbUser.proveedor_id)
      return reporte;

    if (dbUser.rol_id === 2 && reporte.usuario_id === dbUser.usuario_id)
      return reporte;

    throw new ForbiddenException('Sin permisos para ver este reporte');
  }

  async update(id: number, dto: UpdateReporteDto, dbUser: any) {
    const original = await this.prisma.reporte.findUnique({
      where: { reporte_id: id },
      include: { unidad: true },
    });

    if (!original) throw new NotFoundException('Reporte no encontrado');

    if (dbUser.rol_id === 2) throw new ForbiddenException('Operador no puede modificar reportes');

    if (dbUser.rol_id === 4 && original.unidad.proveedor_id !== dbUser.proveedor_id)
      throw new ForbiddenException('No pertenece a su flota');

    return this.prisma.reporte.update({
      where: { reporte_id: id },
      data: dto,
    });
  }

  async remove(id: number, dbUser: any) {
    if (dbUser.rol_id !== 1) {
      throw new ForbiddenException('Solo un administrador puede eliminar reportes');
    }

    return this.prisma.reporte.delete({
      where: { reporte_id: id },
    });
  }
}
