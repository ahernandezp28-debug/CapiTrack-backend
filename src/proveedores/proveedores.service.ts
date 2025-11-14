import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedore.dto';
import { UpdateProveedorDto } from './dto/update-proveedore.dto';

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProveedorDto) {
    return this.prisma.proveedor.create({ data });
  }

  findAll() {
    return this.prisma.proveedor.findMany();
  }

  findOne(id: number) {
    return this.prisma.proveedor.findUnique({ where: { proveedor_id: id } });
  }

  async update(id: number, data: UpdateProveedorDto) {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Proveedor no existe');
    return this.prisma.proveedor.update({
      where: { proveedor_id: id },
      data,
    });
  }

  async remove(id: number) {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Proveedor no existe');
    return this.prisma.proveedor.delete({ where: { proveedor_id: id } });
  }
}
