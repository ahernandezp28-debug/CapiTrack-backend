import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JornadasService } from './jornada.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CreateJornadaDto } from './dto/create-jornada.dto';

@Controller('jornadas')
@UseGuards(FirebaseAuthGuard)
export class JornadasController {
  constructor(private readonly service: JornadasService) {}

  @Post()
  crear(@Req() req, @Body() dto: CreateJornadaDto) {
    return this.service.create(dto, req['dbUser']);
  }

  @Get()
  listar(@Req() req) {
    return this.service.findAll(req['dbUser']);
  }

  @Patch(':id/finalizar')
  finalizar(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.finalizar(id, req['dbUser']);
  }
}
