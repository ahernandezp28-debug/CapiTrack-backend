// src/usuarios/usuarios.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Req,
  NotFoundException,
  Put,
  Param,
  Body,
  Delete,
  ForbiddenException,
} from "@nestjs/common";
import type { Request } from "express";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";

@Controller("usuarios")
export class UsuariosController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get("profile/me")
  async me(@Req() req: Request) {
    const authUser = (req as any).user;
    let appUser: any | null = null;

    if (!authUser?.email) {
      throw new NotFoundException("No se encontró el email en el usuario autenticado");
    }

    const user = await this.prisma.usuario.findUnique({
      where: { correo: authUser.email },
      include: { unidades: true },
    });

    if (!user) {
      throw new NotFoundException("Usuario interno no encontrado");
    }

    const unidadAsignada = user.unidades[0] ?? null;

    appUser = {
      usuario_id: user.usuario_id,
      nombre: user.nombre,
      correo: user.correo,
      rol_id: user.rol_id,
      estado: user.estado,
      unidadAsignadaId: unidadAsignada?.unidad_id ?? null,
      unidadNombre: unidadAsignada?.nombre ?? null,
    };

    return { ok: true, auth: authUser ?? null, appUser };
  }

  // listado operadores
  @UseGuards(FirebaseAuthGuard)
  @Get("operadores")
  async getOperadores() {
    const operadores = await this.prisma.usuario.findMany({
      where: { rol_id: 2, estado: true },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
      orderBy: { nombre: "asc" },
    });

    return { ok: true, total: operadores.length, data: operadores };
  }

  // Opcional: listado admins (útil para frontend)
  @UseGuards(FirebaseAuthGuard)
  @Get("admins")
  async getAdmins() {
    const admins = await this.prisma.usuario.findMany({
      where: { rol_id: 1, estado: true },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
      orderBy: { nombre: "asc" },
    });

    return { ok: true, total: admins.length, data: admins };
  }

  // =========================
  // Actualizar usuario (PUT /usuarios/:id)
  // =========================
  @UseGuards(FirebaseAuthGuard)
  @Put(":id")
  async updateUsuario(@Param("id") id: string, @Body() dto: UpdateUsuarioDto, @Req() req: Request) {
    const authUser = (req as any).user;
    const requesterEmail = authUser?.email ?? null;

    // opcional: restricción — solo admins (rol_id=1) pueden cambiar rol de otros o hacer cambios críticos
    const requester = await this.prisma.usuario.findUnique({ where: { correo: requesterEmail } });
    if (!requester) {
      throw new NotFoundException("Usuario que realiza la petición no encontrado");
    }

    // Buscar usuario a actualizar
    const usuario = await this.prisma.usuario.findUnique({ where: { usuario_id: Number(id) } });
    if (!usuario) {
      throw new NotFoundException("Usuario a actualizar no encontrado");
    }

    // Si se intenta cambiar rol y quien pide no es admin -> forbidden
    if (typeof dto.rol_id === "number" && requester.rol_id !== 1) {
      throw new ForbiddenException("Solo administradores pueden cambiar el rol de un usuario");
    }

    // Validaciones básicas: si intentan asignar rol 1 a alguien y requester no es admin -> forbidden
    if (dto.rol_id === 1 && requester.rol_id !== 1) {
      throw new ForbiddenException("Solo administradores pueden asignar rol administrador");
    }

    const updated = await this.prisma.usuario.update({
      where: { usuario_id: Number(id) },
      data: {
        nombre: dto.nombre ?? usuario.nombre,
        correo: dto.correo ?? usuario.correo,
        rol_id: typeof dto.rol_id === "number" ? dto.rol_id : usuario.rol_id,
        // NOTA: no editar password aquí; si deseas soportarlo, implementar manejo seguro
      },
      select: { usuario_id: true, nombre: true, correo: true, rol_id: true },
    });

    return { ok: true, usuario: updated };
  }

  // =========================
  // Eliminar usuario (DELETE /usuarios/:id)
  // =========================
  @UseGuards(FirebaseAuthGuard)
  @Delete(":id")
  async deleteUsuario(@Param("id") id: string, @Req() req: Request) {
    const authUser = (req as any).user;
    const requesterEmail = authUser?.email ?? null;

    const requester = await this.prisma.usuario.findUnique({ where: { correo: requesterEmail } });
    if (!requester) {
      throw new NotFoundException("Usuario que realiza la petición no encontrado");
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { usuario_id: Number(id) } });
    if (!usuario) {
      throw new NotFoundException("Usuario a eliminar no encontrado");
    }

    // Protege eliminar administradores desde el endpoint (solo otro admin puede eliminar)
    if (usuario.rol_id === 1) {
      if (requester.rol_id !== 1) {
        throw new ForbiddenException("No tienes permisos para eliminar administradores");
      }
      // adicional: no te dejes eliminar a ti mismo accidentalmente
      if (requester.usuario_id === usuario.usuario_id) {
        throw new ForbiddenException("No puedes eliminar tu propia cuenta desde este endpoint");
      }
    }

    await this.prisma.usuario.delete({ where: { usuario_id: Number(id) } });

    return { ok: true, message: "Usuario eliminado" };
  }
}
