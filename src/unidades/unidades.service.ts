import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnidadDto } from './dto/create-unidade.dto';
import { UpdateUnidadDto } from './dto/update-unidade.dto';

@Injectable()
export class UnidadesService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
// 🟢 Crear una nueva unidad (versión mejorada)
// ======================================================
async create(createUnidadDto: CreateUnidadDto, dbUser: any) {
  const { rol_id, usuario_id, proveedor_id } = dbUser;

  // 🔒 1. Los operadores no pueden crear unidades
  if (rol_id === 2) {
    throw new ForbiddenException('Los operadores no pueden crear unidades');
  }

  // 🔒 2. Encargado de flotilla debe tener proveedor asignado
  if (rol_id === 4 && !proveedor_id) {
    throw new ForbiddenException(
      'El encargado de flotilla no tiene proveedor asignado'
    );
  }

  // 🔒 3. Si el usuario operador_id es requerido, debe existir en la base de datos
  if (createUnidadDto.usuario_operador_id) {
    const operador = await this.prisma.usuario.findUnique({
      where: { usuario_id: createUnidadDto.usuario_operador_id },
    });

    if (!operador || operador.rol_id !== 2) {
      throw new ForbiddenException(
        'El usuario asignado como operador no es válido o no existe'
      );
    }
  }

  // 🔒 4. Si el rol es encargado de flotilla, forzamos el proveedor_id
  if (rol_id === 4) {
    createUnidadDto.proveedor_id = proveedor_id;
  }

  // 🔒 5. Si no hay operador asignado, rechazamos
  if (!createUnidadDto.usuario_operador_id) {
    throw new ForbiddenException(
      'Debe asignar un operador (usuario con rol de Operador)'
    );
  }

  // ✅ 6. Crear la unidad
  return this.prisma.unidad.create({
    data: {
      ...createUnidadDto,
    },
  });
}

  // ======================================================
  // 🔵 Obtener todas las unidades
  // ======================================================
  async findAll(dbUser: any) {
    const { rol_id, usuario_id, proveedor_id } = dbUser;

    if (rol_id === 1) {
      // 🟣 Admin ve todas
      return this.prisma.unidad.findMany({
        include: { proveedor: true, operador: true },
      });
    }

    if (rol_id === 4) {
      // 🟢 Encargado de flotilla ve solo sus unidades
      return this.prisma.unidad.findMany({
        where: { proveedor_id },
        include: { proveedor: true, operador: true },
      });
    }

    if (rol_id === 2) {
      // 🔵 Operador ve solo sus unidades asignadas
      return this.prisma.unidad.findMany({
        where: { usuario_operador_id: usuario_id },
        include: { proveedor: true, operador: true },
      });
    }

    throw new ForbiddenException('Rol no autorizado para ver unidades');
  }

  // ======================================================
  // 🟣 Obtener una unidad por ID
  // ======================================================
  async findOne(id: number, dbUser: any) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: id },
      include: { proveedor: true, operador: true },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    const { rol_id, usuario_id, proveedor_id } = dbUser;

    if (rol_id === 1) return unidad; // Admin
    if (rol_id === 4 && unidad.proveedor_id === proveedor_id) return unidad;
    if (rol_id === 2 && unidad.usuario_operador_id === usuario_id) return unidad;

    throw new ForbiddenException('No tiene permisos para acceder a esta unidad');
  }

  // ======================================================
// 🟠 Actualizar una unidad (versión validada)
// ======================================================
async update(id: number, updateUnidadDto: UpdateUnidadDto, dbUser: any) {
  const unidad = await this.prisma.unidad.findUnique({
    where: { unidad_id: id },
  });

  if (!unidad) {
    throw new NotFoundException('Unidad no encontrada');
  }

  const { rol_id, usuario_id, proveedor_id } = dbUser;

  // 🔒 1. Operadores no pueden modificar unidades
  if (rol_id === 2) {
    throw new ForbiddenException('Los operadores no pueden modificar unidades');
  }

  // 🔒 2. Encargado de flotilla solo puede modificar unidades de su proveedor
  if (rol_id === 4 && unidad.proveedor_id !== proveedor_id) {
    throw new ForbiddenException(
      'No puede modificar unidades de otros proveedores'
    );
  }

  // 🔒 3. Si se intenta cambiar el operador, validar que sea un operador válido
  if (updateUnidadDto.usuario_operador_id) {
    const operador = await this.prisma.usuario.findUnique({
      where: { usuario_id: updateUnidadDto.usuario_operador_id },
    });

    if (!operador || operador.rol_id !== 2) {
      throw new ForbiddenException(
        'El usuario asignado como operador no es válido o no existe'
      );
    }
  }

  // 🔒 4. No permitir dejar la unidad sin operador
  if (updateUnidadDto.usuario_operador_id === null) {
    throw new ForbiddenException('La unidad debe tener un operador asignado');
  }

  // ✅ 5. Actualizar la unidad
  return this.prisma.unidad.update({
    where: { unidad_id: id },
    data: updateUnidadDto,
  });
}


  // ======================================================
  // 🔴 Eliminar una unidad
  // ======================================================
  async remove(id: number, dbUser: any) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { unidad_id: id },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    if (dbUser.rol_id !== 1) {
      throw new ForbiddenException('Solo los administradores pueden eliminar unidades');
    }

    return this.prisma.unidad.delete({
      where: { unidad_id: id },
    });
  }
}
