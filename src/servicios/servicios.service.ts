// src/servicio/servicio.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';

type DbUserLike = {
  usuario_id: number;
  rol_id: number;
  proveedor_id?: number | null;
};

@Injectable()
export class ServicioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resuelve el usuario interno (tabla usuarios) a partir de lo que venga en req.user:
   * - Si ya trae rol_id / usuario_id → lo usa directo
   * - Si trae appUser → lo usa
   * - Si es solo el token Firebase → busca por correo en Prisma
   */
  private async getDbUserFromReq(reqUser: any): Promise<DbUserLike> {
    if (!reqUser) {
      throw new ForbiddenException('Usuario sin rol');
    }

    // Caso 1: ya es un usuario interno
    if (
      typeof reqUser.usuario_id === 'number' &&
      typeof reqUser.rol_id === 'number'
    ) {
      return {
        usuario_id: reqUser.usuario_id,
        rol_id: reqUser.rol_id,
        proveedor_id: reqUser.proveedor_id ?? null,
      };
    }

    // Caso 2: viene como { auth, appUser }
    const appUser = reqUser.appUser ?? reqUser.dbUser ?? null;
    if (
      appUser &&
      typeof appUser.usuario_id === 'number' &&
      typeof appUser.rol_id === 'number'
    ) {
      return {
        usuario_id: appUser.usuario_id,
        rol_id: appUser.rol_id,
        proveedor_id: appUser.proveedor_id ?? null,
      };
    }

    // Caso 3: es un token Firebase (tiene email pero no rol_id)
    const email: string | undefined = reqUser.email;
    if (email) {
      const usuario = await this.prisma.usuario.findFirst({
        where: { correo: email },
      });

      if (!usuario) {
        throw new ForbiddenException(
          'Usuario interno no encontrado para este token',
        );
      }

      return {
        usuario_id: usuario.usuario_id,
        rol_id: usuario.rol_id,
        // si tu modelo Usuario tiene proveedor_id:
        proveedor_id: (usuario as any).proveedor_id ?? null,
      };
    }

    throw new ForbiddenException('Usuario sin rol');
  }

  // 🟢 Crear servicio (operador pide servicio)
  async create(dto: CreateServicioDto, reqUser: any) {
    const dbUser = await this.getDbUserFromReq(reqUser);

    const servicio = await this.prisma.servicio.create({
      data: {
        tipo: dto.tipo,
        descripcion: dto.descripcion ?? null,
        fecha: new Date(),
        unidad_id: dto.unidad_id, // asumes que el operador la manda
        usuario_id: dbUser.usuario_id,
      },
    });

    return servicio;
  }

  // 🔵 Listar servicios (admin / encargado / operador)
  async findAll(reqUser: any) {
    const dbUser = await this.getDbUserFromReq(reqUser);
    const { rol_id, usuario_id, proveedor_id } = dbUser;

    const baseInclude = {
      unidad: true,
      usuario: true,
    } as const;

    // 1️⃣ Admin ve todos
    if (rol_id === 1) {
      const rows = await this.prisma.servicio.findMany({
        include: baseInclude,
        orderBy: { fecha: 'desc' },
      });
      return rows.map(mapServicioRow);
    }

    // 2️⃣ Encargado ve solo unidades de su proveedor
    if (rol_id === 4 && proveedor_id) {
      const rows = await this.prisma.servicio.findMany({
        where: {
          unidad: {
            proveedor_id,
          },
        },
        include: baseInclude,
        orderBy: { fecha: 'desc' },
      });
      return rows.map(mapServicioRow);
    }

    // 3️⃣ Operador ve sus solicitudes
    if (rol_id === 2) {
      const rows = await this.prisma.servicio.findMany({
        where: { usuario_id },
        include: baseInclude,
        orderBy: { fecha: 'desc' },
      });
      return rows.map(mapServicioRow);
    }

    throw new ForbiddenException('Rol no autorizado para ver servicios');
  }
}

function mapServicioRow(row: any) {
  return {
    servicio_id: row.servicio_id,
    tipo: row.tipo,
    descripcion: row.descripcion,
    fecha: row.fecha,
    unidad_id: row.unidad_id,
    usuario_id: row.usuario_id,
    unidad_nombre: row.unidad?.nombre ?? null,
    unidad_placa: row.unidad?.placa ?? null,
    operador_nombre: row.usuario?.nombre ?? null,
  };
}
