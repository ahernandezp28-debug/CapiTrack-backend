import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: { nombre: string; correo: string; password: string }) {
    return this.auth.register(body.nombre, body.correo, body.password);
  }

  @Post('forgot')
  forgot(@Body() body: { correo: string }) {
    return this.auth.forgotPassword(body.correo);
  }
}
