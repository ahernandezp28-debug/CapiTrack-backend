// src/usuarios/usuarios.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma, Usuario } from '@prisma/client';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  private prisma = new PrismaClient();

  async create(createUsuarioDto: CreateUsuarioDto, dbUser: Usuario) {
    // Solo admins pueden crear usuarios
    if (dbUser.rol_id !== 1) {
      throw new ForbiddenException('No tienes permisos para crear usuarios');
    }

    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        estado: true,
        creado_en: new Date(),
        actualizado_en: new Date(),
      },
    });
  }

  async findAll(params: { page?: number; limit?: number; q?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    let where: Prisma.UsuarioWhereInput = {};

    if (params.q) {
      where = {
        OR: [
          { nombre: { contains: params.q, mode: 'insensitive' } },
          { correo: { contains: params.q, mode: 'insensitive' } },
        ],
      };
    }

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { usuario_id: 'asc' },
        select: {
          usuario_id: true,
          nombre: true,
          correo: true,
          rol_id: true,
          estado: true,
          creado_en: true,
          actualizado_en: true,
        },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      usuarios,
    };
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { usuario_id: id } });
    if (!usuario) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto, dbUser: Usuario) {
    // Solo admins pueden actualizar otros usuarios
    if (dbUser.rol_id !== 1) {
      throw new ForbiddenException('No tienes permisos para actualizar usuarios');
    }

    return this.prisma.usuario.update({
      where: { usuario_id: id },
      data: {
        ...updateUsuarioDto,
        actualizado_en: new Date(),
      },
    });
  }

  async remove(id: number, dbUser: Usuario) {
    // Solo admins pueden eliminar usuarios
    if (dbUser.rol_id !== 1) {
      throw new ForbiddenException('No tienes permisos para eliminar usuarios');
    }

    return this.prisma.usuario.delete({ where: { usuario_id: id } });
  }
}

