import {
  Injectable,
  ForbiddenException,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJornadaDto } from './dto/create-jornada.dto';

@Injectable()
export class JornadasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJornadaDto, dbUser: any) {
    if (dbUser.rol_id !== 2) {
      throw new ForbiddenException('Solo los operadores pueden iniciar jornadas');
    }

    const ahora = new Date();

    return this.prisma.jornada.create({
      data: {
        usuario_id: dbUser.usuario_id,
        unidad_id: dto.unidad_id,
        fecha: ahora,
        hora_inicio: ahora,
        hora_fin: ahora, // Se actualizará luego
      },
    });
  }

  async findAll(dbUser: any) {
    return this.prisma.jornada.findMany({
      where: {
        usuario_id: dbUser.usuario_id,
      },
    });
  }

  async finalizar(id: number, dbUser: any) {
    const jornada = await this.prisma.jornada.findUnique({
      where: { jornada_id: id },
    });

    if (!jornada) {
      throw new NotFoundException('Jornada no encontrada');
    }

    if (jornada.usuario_id !== dbUser.usuario_id) {
      throw new ForbiddenException('No puede finalizar jornadas de otro usuario');
    }

    const ahora = new Date();
    const horas =
      (ahora.getTime() - jornada.hora_inicio.getTime()) /
      (1000 * 60 * 60);

    return this.prisma.jornada.update({
      where: { jornada_id: id },
      data: {
        hora_fin: ahora,
        horas_trabajo: parseFloat(horas.toFixed(2)),
      },
    });
  }
}
