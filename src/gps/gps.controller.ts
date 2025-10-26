import { Controller, Post, Get, Body, Param, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GpsService } from './gps.service';
import { CreateGpsDto } from './dto/create-gps.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('gps')
@UseGuards(FirebaseAuthGuard)
export class GpsController {
  constructor(private service: GpsService) {}

  @Post()
  registrar(@Req() req, @Body() dto: CreateGpsDto) {
    return this.service.create(dto, req['dbUser']);
  }

  @Get('unidad/:id')
  obtenerPorUnidad(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findAllByUnidad(id, req['dbUser']);
  }

  @Get('unidad/:id/ultima')
obtenerUltima(
  @Req() req,
  @Param('id', ParseIntPipe) id: number
) {
  return this.service.ultimaPosicion(id, req['dbUser']);
}

@Get('unidad/:id/ruta')
obtenerRuta(
  @Req() req,
  @Param('id', ParseIntPipe) id: number
) {
  const limite = Number(req.query.limite) || 20;
  return this.service.ruta(id, limite, req['dbUser']);
}

}
