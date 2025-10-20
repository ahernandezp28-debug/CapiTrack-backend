import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  findAll() {
    return this.usuariosService.findAll();
  }
}

