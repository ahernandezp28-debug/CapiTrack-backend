import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedore.dto';
import { UpdateProveedorDto } from './dto/update-proveedore.dto';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear proveedor
  async create(createProveedorDto: CreateProveedorDto, dbUser: any) {
    const { rol_id } = dbUser;

    if (![1, 4].includes(rol_id)) {
      throw new ForbiddenException('Solo los administradores o encargados pueden crear proveedores');
    }

    return this.prisma.proveedor.create({
      data: {
        nombre: createProveedorDto.nombre,
        contacto: createProveedorDto.contacto,
      },
    });
  }

  // Listar proveedores
  async findAll(dbUser: any) {
    const { rol_id } = dbUser;

    if (rol_id === 2) {
      throw new ForbiddenException('Los operadores no tienen acceso a proveedores');
    }

    return this.prisma.proveedor.findMany({
      include: { unidades: true },
    });
  }

  // Buscar proveedor por ID
  async findOne(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { proveedor_id: id },
      include: { unidades: true },
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return proveedor;
  }

  // Actualizar proveedor
  async update(id: number, updateProveedorDto: UpdateProveedorDto, dbUser: any) {
    const { rol_id } = dbUser;

    if (![1, 4].includes(rol_id)) {
      throw new ForbiddenException('Solo los administradores o encargados pueden actualizar proveedores');
    }

    return this.prisma.proveedor.update({
      where: { proveedor_id: id },
      data: updateProveedorDto,
    });
  }

  // Eliminar proveedor
  async remove(id: number, dbUser: any) {
    const { rol_id } = dbUser;

    if (rol_id !== 1) {
      throw new ForbiddenException('Solo los administradores pueden eliminar proveedores');
    }

    const proveedor = await this.prisma.proveedor.findUnique({
      where: { proveedor_id: id },
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return this.prisma.proveedor.delete({
      where: { proveedor_id: id },
    });
  }
}

