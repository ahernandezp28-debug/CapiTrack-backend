// src/usuarios/usuarios.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findOperadores() {
    return this.prisma.usuario.findMany({
      where: { rol_id: 2, estado: true },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findAdmins() {
    return this.prisma.usuario.findMany({
      where: { rol_id: 1, estado: true },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async updateUsuario(id: number, dto: UpdateUsuarioDto, requesterCorreo: string) {
    const requester = await this.prisma.usuario.findUnique({ where: { correo: requesterCorreo } });
    if (!requester) throw new NotFoundException('Usuario que realiza la petición no encontrado');

    const usuario = await this.prisma.usuario.findUnique({ where: { usuario_id: id } });
    if (!usuario) throw new NotFoundException('Usuario a actualizar no encontrado');

    if (typeof dto.rol_id === 'number' && requester.rol_id !== 1) {
      throw new ForbiddenException('Solo administradores pueden cambiar el rol de un usuario');
    }

    const updated = await this.prisma.usuario.update({
      where: { usuario_id: id },
      data: {
        nombre: dto.nombre ?? usuario.nombre,
        correo: dto.correo ?? usuario.correo,
        rol_id: typeof dto.rol_id === 'number' ? dto.rol_id : usuario.rol_id,
      },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
    });

    return updated;
  }

  /**
   * Elimina físicamente el usuario.
   * Lanza:
   * - NotFoundException si requester o usuario no existen
   * - ForbiddenException si requester no tiene permiso para eliminar admins / a si mismo
   * - ConflictException si hay FK que impiden eliminar (Prisma P2003 / Postgres 23503)
   * - InternalServerErrorException para otros errores
   *
   * Devuelve el registro eliminado (select) cuando se completa.
   */
  async deleteUsuario(id: number, requesterCorreo: string) {
    console.log('[UsuariosService] deleteUsuario called', { id, requesterCorreo });

    const requester = await this.prisma.usuario.findUnique({ where: { correo: requesterCorreo } });
    if (!requester) throw new NotFoundException('Usuario que realiza la petición no encontrado');

    const usuario = await this.prisma.usuario.findUnique({ where: { usuario_id: id } });
    if (!usuario) throw new NotFoundException('Usuario a eliminar no encontrado');

    if (usuario.rol_id === 1) {
      if (requester.rol_id !== 1) {
        throw new ForbiddenException('No tienes permisos para eliminar administradores');
      }
      if (requester.usuario_id === usuario.usuario_id) {
        throw new ForbiddenException('No puedes eliminar tu propia cuenta desde este endpoint');
      }
    }

    try {
      // Borra y retorna la fila eliminada (útil para confirmar en frontend)
      const deleted = await this.prisma.usuario.delete({
        where: { usuario_id: id },
        select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
      });
      console.log('[UsuariosService] deleteUsuario success', { id });
      return deleted;
    } catch (err: any) {
      console.error('[UsuariosService] deleteUsuario error', err);

      // Prisma foreign key constraint error (P2003) or Postgres 23503
      if (err?.code === 'P2003' || err?.code === '23503') {
        throw new ConflictException(
          'El usuario tiene registros relacionados. Elimina dependencias primero o utiliza soft-delete.',
        );
      }

      // Prisma record not found on delete (P2025) — fallback
      if (err?.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado (al intentar borrar)');
      }

      // Fallback general
      throw new InternalServerErrorException('Error al eliminar usuario: ' + (err?.message ?? 'unknown'));
    }
  }

  /*
   * Alternativa recomendada cuando hay muchas relaciones: soft-delete
   *
   * async softDeleteUsuario(id: number, requesterCorreo: string) {
   *   // mismas validaciones de permisos...
   *   return this.prisma.usuario.update({
   *     where: { usuario_id: id },
   *     data: { estado: false },
   *     select: { usuario_id: true, nombre: true, correo: true, rol_id: true, estado: true },
   *   });
   * }
   */
}
