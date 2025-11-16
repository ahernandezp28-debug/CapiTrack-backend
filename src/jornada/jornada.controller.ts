// src/jornada/jornada.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JornadaService } from './jornada.service';
import { IniciarJornadaDto } from './dto/iniciar-jornada.dto';
import { FinalizarJornadaDto } from './dto/finalizar-jornada.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('jornadas')
@UseGuards(FirebaseAuthGuard) // 👈 protegemos TODO el controlador
export class JornadaController {
  constructor(private readonly jornadaService: JornadaService) {}

  @Post('inicio')
  async inicio(@Req() req: any, @Body() dto: IniciarJornadaDto) {
    const user = req.user;

    // 🔍 tratamos de sacar el email igual que en /usuarios/profile/me
    const email =
      user?.email ??
      user?.correo ?? // por si lo mapeaste así
      user?.decodedToken?.email ??
      user?.auth?.email ??
      null;

    return this.jornadaService.iniciarJornada(dto, email);
  }

  @Post('fin')
  async fin(@Req() req: any, @Body() dto: FinalizarJornadaDto) {
    const user = req.user;

    const email =
      user?.email ??
      user?.correo ??
      user?.decodedToken?.email ??
      user?.auth?.email ??
      null;

    return this.jornadaService.finalizarJornada(dto, email);
  }
}


