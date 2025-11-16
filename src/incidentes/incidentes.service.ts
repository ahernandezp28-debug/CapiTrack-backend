// src/incidente/incidente.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';

type DbUserLike = {
  usuario_id: number;
  rol_id: number;
  proveedor_id?: number | null;
};

@Injectable()
export class IncidenteService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDbUserFromReq(reqUser: any): Promise<DbUserLike> {
    if (!reqUser) {
      throw new ForbiddenException('Usuario sin rol');
    }

    // Caso 1: ya es usuario interno
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

    // Caso 2: { auth, appUser }
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

    // Caso 3: token Firebase con email
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
        proveedor_id: (usuario as any).proveedor_id ?? null,
      };
    }

    throw new ForbiddenException('Usuario sin rol');
  }

  // 🟢 Crear incidente
  async create(dto: CreateIncidenteDto, reqUser: any) {
    const dbUser = await this.getDbUserFromReq(reqUser);

    const incidente = await this.prisma.incidente.create({
      data: {
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        severidad: dto.severidad,
        fecha: new Date(),
        unidad_id: dto.unidad_id,
        usuario_id: dbUser.usuario_id,
      },
    });

    return incidente;
  }

  // 🔵 Listar incidentes
  async findAll(reqUser: any) {
    const dbUser = await this.getDbUserFromReq(reqUser);
    const { rol_id, usuario_id, proveedor_id } = dbUser;

    const baseInclude = {
      unidad: true,
      usuario: true,
    } as const;

    // 1️⃣ Admin ve todos
    if (rol_id === 1) {
      const rows = await this.prisma.incidente.findMany({
        include: baseInclude,
        orderBy: { fecha: 'desc' },
      });
      return rows.map(mapIncidenteRow);
    }

    // 2️⃣ Encargado: unidades de su proveedor
    if (rol_id === 4 && proveedor_id) {
      const rows = await this.prisma.incidente.findMany({
        where: {
          unidad: {
            proveedor_id,
          },
        },
        include: baseInclude,
        orderBy: { fecha: 'desc' },
      });
      return rows.map(mapIncidenteRow);
    }

    // 3️⃣ Operador: solo sus incidentes
    if (rol_id === 2) {
      const rows = await this.prisma.incidente.findMany({
        where: { usuario_id },
        include: baseInclude,
        orderBy: { fecha: 'desc' },
      });
      return rows.map(mapIncidenteRow);
    }

    throw new ForbiddenException('Rol no autorizado para ver incidentes');
  }
}

function mapIncidenteRow(row: any) {
  return {
    incidente_id: row.incidente_id,
    tipo: row.tipo,
    descripcion: row.descripcion,
    fecha: row.fecha,
    severidad: row.severidad,
    unidad_id: row.unidad_id,
    usuario_id: row.usuario_id,
    unidad_nombre: row.unidad?.nombre ?? null,
    unidad_placa: row.unidad?.placa ?? null,
    operador_nombre: row.usuario?.nombre ?? null,
  };
}
