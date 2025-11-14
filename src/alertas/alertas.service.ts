import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AlertasService {
  constructor(
    private prisma: PrismaService,
    private notif: NotificationsService, 
  ) {}

  
  async create(dto: CreateAlertaDto, dbUser: any) {
    const { rol_id, usuario_id } = dbUser;

    if (rol_id === 2) {
      const unidad = await this.prisma.unidad.findUnique({
        where: { unidad_id: dto.unidad_id },
      });

      if (!unidad || unidad.usuario_operador_id !== usuario_id) {
        throw new ForbiddenException('No puede reportar alertas de esta unidad');
      }
    }

    const alerta = await this.prisma.alerta.create({
      data: dto,
      include: { unidad: true },
    });

    
    this.notif.emitirNuevaAlerta({
      id: alerta.alerta_id,
      tipo: alerta.tipo,
      mensaje: alerta.mensaje,
      prioridad: alerta.prioridad,
      unidad: alerta.unidad?.nombre ?? 'No asignada',
      fecha: alerta.fecha_generada,
      evento: 'alerta_creada',
    });

    return alerta;
  }

  
  async findAll(dbUser: any) {
    const { rol_id, usuario_id, proveedor_id } = dbUser;

    if (rol_id === 1) {
      return this.prisma.alerta.findMany({ include: { unidad: true } });
    }

    if (rol_id === 4) {
      return this.prisma.alerta.findMany({
        where: { unidad: { proveedor_id } },
        include: { unidad: true },
      });
    }

    return this.prisma.alerta.findMany({
      where: { unidad: { usuario_operador_id: usuario_id } },
      include: { unidad: true },
    });
  }

  async findOne(id: number, dbUser: any) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { alerta_id: id },
      include: { unidad: true },
    });

    if (!alerta) throw new NotFoundException('Alerta no encontrada');

    return alerta;
  }

  async update(id: number, dto: UpdateAlertaDto, dbUser: any) {
    if (dbUser.rol_id !== 1 && dbUser.rol_id !== 4) {
      throw new ForbiddenException('No autorizado para editar alertas');
    }

    const alerta = await this.prisma.alerta.update({
      where: { alerta_id: id },
      data: dto,
      include: { unidad: true },
    });

    // Notificación en tiempo real por edición
    this.notif.emitirNuevaAlerta({
      id: alerta.alerta_id,
      mensaje: 'Se actualizó una alerta',
      unidad: alerta.unidad?.nombre,
      evento: 'alerta_actualizada',
    });

    return alerta;
  }

  async remove(id: number, dbUser: any) {
    if (dbUser.rol_id !== 1) {
      throw new ForbiddenException('Solo administradores pueden eliminar alertas');
    }

    await this.prisma.alerta.delete({ where: { alerta_id: id } });

    //  Notificación de eliminación
    this.notif.emitirNuevaAlerta({
      id,
      evento: 'alerta_eliminada',
    });

    return { message: 'Alerta eliminada correctamente' };
  }
}
