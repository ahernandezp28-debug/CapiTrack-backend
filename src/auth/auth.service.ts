import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { EmailService } from '../notifications/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseAdminService,
    private email: EmailService,
  ) {}

  // Registro: crea usuario en Firebase, guarda en tu DB y envía verificación
  async register(nombre: string, correo: string, password: string) {
    // 1) Crear usuario en Firebase
    const fbUser = await this.firebase.getAuth().createUser({
      displayName: nombre,
      email: correo,
      password,
    });

    // 2) Hash local SOLO para cumplir el schema
    const hash = await bcrypt.hash(password, 10);

    // 3) Rol por defecto
    const rolOperador = await this.prisma.rol.findFirst({ where: { nombre: 'Operador' } });
    const rolId = rolOperador ? rolOperador.rol_id : await this.ensureAnyRole();

    // 4) Guardar en DB local
    await this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        password: hash,
        firebaseUid: fbUser.uid,
        rol_id: rolId,
      },
    });

    // 5) Link de verificación de correo + envío con Resend
    const verifyLink = await this.firebase.getAuth().generateEmailVerificationLink(correo, {
      url: process.env.CLIENT_APP_URL || 'https://app.capitrack.com',
      handleCodeInApp: true,
    });
    await this.email.sendVerificationEmail(correo, verifyLink, nombre);

    return { ok: true, uid: fbUser.uid };
  }

  // Olvidé contraseña: genera link de Firebase y lo envía con Resend
  async forgotPassword(correo: string) {
    const link = await this.firebase.getAuth().generatePasswordResetLink(correo, {
      url: process.env.CLIENT_APP_URL || 'https://app.capitrack.com',
      handleCodeInApp: true,
    });
    await this.email.sendResetPasswordEmail(correo, link);
    return { ok: true };
  }

  // Helper: garantizar que exista algún rol y devolver su id
  private async ensureAnyRole(): Promise<number> {
    const count = await this.prisma.rol.count();
    if (count === 0) {
      const r = await this.prisma.rol.create({ data: { nombre: 'Operador' } });
      return r.rol_id;
    }
    const r = await this.prisma.rol.findFirst();
    if (!r) throw new BadRequestException('No hay roles disponibles');
    return r.rol_id;
  }
} 
