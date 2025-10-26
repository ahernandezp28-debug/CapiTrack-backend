import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  // Crear servicio
  async create(dto: CreateServicioDto, dbUser: any) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: dto.unidad_id },
    });

    if (!unidad) throw new NotFoundException('Unidad no encontrada');

    // Operador solo puede registrar servicios a su unidad
    if (dbUser.rol_id === 2 && unidad.usuario_operador_id !== dbUser.usuario_id)
      throw new ForbiddenException('No puede registrar servicios en una unidad que no opera');

    // Encargado solo en unidades de su proveedor
    if (dbUser.rol_id === 4 && unidad.proveedor_id !== dbUser.proveedor_id)
      throw new ForbiddenException('No puede registrar servicios en otra flotilla');

    return this.prisma.servicio.create({
      data: {
        ...dto,
        usuario_id: dbUser.usuario_id,
      },
    });
  }

  async findAll(dbUser: any) {
    return this.prisma.servicio.findMany({
      include: { unidad: true, usuario: true },
    });
  }

  async findOne(id: number, dbUser: any) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { servicio_id: id },
      include: { unidad: true, usuario: true },
    });

    if (!servicio) throw new NotFoundException('Servicio no encontrado');

    const unidad = servicio.unidad;

    if (dbUser.rol_id === 2 && unidad.usuario_operador_id !== dbUser.usuario_id)
      throw new ForbiddenException('No tiene permiso');

    if (dbUser.rol_id === 4 && unidad.proveedor_id !== dbUser.proveedor_id)
      throw new ForbiddenException('No tiene permiso');

    return servicio;
  }

  async update(id: number, dto: UpdateServicioDto, dbUser: any) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { servicio_id: id },
      include: { unidad: true },
    });

    if (!servicio) throw new NotFoundException('Servicio no encontrado');

    if (dbUser.rol_id === 2) {
      throw new ForbiddenException('Operador no puede modificar servicios');
    }

    if (dbUser.rol_id === 4 && servicio.unidad.proveedor_id !== dbUser.proveedor_id) {
      throw new ForbiddenException('No puede modificar servicios de otra flotilla');
    }

    return this.prisma.servicio.update({
      where: { servicio_id: id },
      data: dto,
    });
  }

  async remove(id: number, dbUser: any) {
    if (dbUser.rol_id !== 1)
      throw new ForbiddenException('Solo administradores pueden borrar servicios');

    return this.prisma.servicio.delete({ where: { servicio_id: id } });
  }
}

