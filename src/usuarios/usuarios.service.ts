// src/usuarios/usuarios.service.ts
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findOperadores() {
    return this.prisma.usuario.findMany({
      where: { rol_id: 2, estado: true },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
      orderBy: { nombre: "asc" },
    });
  }

  async findAdmins() {
    return this.prisma.usuario.findMany({
      where: { rol_id: 1, estado: true },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
      orderBy: { nombre: "asc" },
    });
  }

  async updateUsuario(id: number, dto: UpdateUsuarioDto, requesterCorreo: string) {
    const requester = await this.prisma.usuario.findUnique({ where: { correo: requesterCorreo } });
    if (!requester) throw new NotFoundException("Usuario que realiza la petición no encontrado");

    const usuario = await this.prisma.usuario.findUnique({ where: { usuario_id: id } });
    if (!usuario) throw new NotFoundException("Usuario a actualizar no encontrado");

    if (typeof dto.rol_id === "number" && requester.rol_id !== 1) {
      throw new ForbiddenException("Solo administradores pueden cambiar el rol de un usuario");
    }

    const updated = await this.prisma.usuario.update({
      where: { usuario_id: id },
      data: {
        nombre: dto.nombre ?? usuario.nombre,
        correo: dto.correo ?? usuario.correo,
        rol_id: typeof dto.rol_id === "number" ? dto.rol_id : usuario.rol_id,
      },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
    });

    return updated;
  }

  async deleteUsuario(id: number, requesterCorreo: string) {
    const requester = await this.prisma.usuario.findUnique({ where: { correo: requesterCorreo } });
    if (!requester) throw new NotFoundException("Usuario que realiza la petición no encontrado");

    const usuario = await this.prisma.usuario.findUnique({ where: { usuario_id: id } });
    if (!usuario) throw new NotFoundException("Usuario a eliminar no encontrado");

    if (usuario.rol_id === 1) {
      if (requester.rol_id !== 1) {
        throw new ForbiddenException("No tienes permisos para eliminar administradores");
      }
      if (requester.usuario_id === usuario.usuario_id) {
        throw new ForbiddenException("No puedes eliminar tu propia cuenta desde este endpoint");
      }
    }

    await this.prisma.usuario.delete({ where: { usuario_id: id } });
    return true;
  }
}
