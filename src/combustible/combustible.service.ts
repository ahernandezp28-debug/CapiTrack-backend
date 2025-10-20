import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCombustibleDto } from './dto/create-combustible.dto';
import { UpdateCombustibleDto } from './dto/update-combustible.dto';

@Injectable()
export class CombustibleService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // 🟢 Crear registro de combustible
  // ======================================================
  async create(dto: CreateCombustibleDto, dbUser: any) {
    const { rol_id, usuario_id } = dbUser;

    if (rol_id === 2) {
      throw new ForbiddenException(
        'Los operadores no pueden registrar combustible',
      );
    }

    // Verificamos que la unidad exista
    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: dto.unidad_id },
    });

    if (!unidad) {
      throw new NotFoundException('La unidad especificada no existe');
    }

    return this.prisma.combustible.create({
      data: {
        tipo: dto.tipo,
        cantidad: dto.cantidad,
        costo_total: dto.costo_total,
        unidad_id: dto.unidad_id,
        usuario_id, // el usuario que lo registró
      },
    });
  }

  // ======================================================
  // 🔵 Obtener todos los registros
  // ======================================================
  async findAll(dbUser: any) {
    const { rol_id, usuario_id } = dbUser;

    if (rol_id === 1) {
      // Administrador: todos
      return this.prisma.combustible.findMany({
        include: { unidad: true },
      });
    }

    if (rol_id === 4) {
      // Encargado: sólo las unidades de su proveedor
      return this.prisma.combustible.findMany({
        where: {
          unidad: {
            proveedor_id: dbUser.proveedor_id || undefined,
          },
        },
        include: { unidad: true },
      });
    }

    if (rol_id === 2) {
      // Operador: sólo los que registró él
      return this.prisma.combustible.findMany({
        where: { usuario_id },
        include: { unidad: true },
      });
    }

    throw new ForbiddenException('Rol no autorizado');
  }

  // ======================================================
  // 🟣 Obtener un registro específico
  // ======================================================
  async findOne(id: number, dbUser: any) {
    const registro = await this.prisma.combustible.findUnique({
      where: { combustible_id: id },
      include: { unidad: true },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    const { rol_id, usuario_id, proveedor_id } = dbUser;

    if (rol_id === 1) return registro;
    if (rol_id === 4 && registro.unidad.proveedor_id === proveedor_id)
      return registro;
    if (rol_id === 2 && registro.usuario_id === usuario_id) return registro;

    throw new ForbiddenException('No tiene permiso para acceder a este registro');
  }

  // ======================================================
  // 🟠 Actualizar un registro
  // ======================================================
  async update(id: number, dto: UpdateCombustibleDto, dbUser: any) {
    const registro = await this.prisma.combustible.findUnique({
      where: { combustible_id: id },
      include: { unidad: true },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    const { rol_id, usuario_id, proveedor_id } = dbUser;

    // Validaciones de permisos
    if (rol_id === 2) {
      throw new ForbiddenException(
        'Los operadores no pueden modificar registros de combustible',
      );
    }

    if (rol_id === 4 && registro.unidad.proveedor_id !== proveedor_id) {
      throw new ForbiddenException(
        'No puede modificar registros de otros proveedores',
      );
    }

    return this.prisma.combustible.update({
      where: { combustible_id: id },
      data: dto,
    });
  }

  // ======================================================
  // 🔴 Eliminar un registro
  // ======================================================
  async remove(id: number, dbUser: any) {
    const registro = await this.prisma.combustible.findUnique({
      where: { combustible_id: id },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    if (dbUser.rol_id !== 1) {
      throw new ForbiddenException('Solo los administradores pueden eliminar registros');
    }

    return this.prisma.combustible.delete({
      where: { combustible_id: id },
    });
  }
}
