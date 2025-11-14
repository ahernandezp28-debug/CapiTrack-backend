import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        '⚠️ RESEND_API_KEY o EMAIL_FROM no definidos. EmailService funcionará en MODO SIMULACIÓN (no se enviarán correos reales).',
      );
      this.resend = null;
      this.from = null;
    } else {
      this.logger.log('✉️ EmailService inicializado con Resend');
      this.resend = new Resend(apiKey);
      this.from = from;
    }
  }

  // 📧 Verificación de correo
  async sendVerificationEmail(to: string, verifyUrlOrToken: string, nombre?: string) {
    const url = verifyUrlOrToken.startsWith('http')
      ? verifyUrlOrToken
      : `${process.env.CLIENT_APP_URL}/verify-email?token=${encodeURIComponent(
          verifyUrlOrToken,
        )}`;

    if (!this.resend || !this.from) {
      // Modo simulación
      this.logger.warn(
        `🔁 [SIMULADO] Enviar verificación a ${to} con link: ${url}`,
      );
      return { simulated: true };
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Verifica tu correo – CapiTrack',
      html: this.templateVerify(nombre ?? 'Usuario', url),
      text: `Confirma tu correo en: ${url}`,
    });

    if (error) {
      this.logger.error(`Resend verify error: ${error.message}`);
      throw error;
    }
  }

  // 📧 Restablecer contraseña
  async sendResetPasswordEmail(to: string, resetUrlOrToken: string, nombre?: string) {
    const url = resetUrlOrToken.startsWith('http')
      ? resetUrlOrToken
      : `${process.env.CLIENT_APP_URL}/reset-password?token=${encodeURIComponent(
          resetUrlOrToken,
        )}`;

    if (!this.resend || !this.from) {
      // Modo simulación
      this.logger.warn(
        `🔁 [SIMULADO] Enviar reset password a ${to} con link: ${url}`,
      );
      return { simulated: true };
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Restablece tu contraseña – CapiTrack',
      html: this.templateReset(nombre ?? 'Usuario', url),
      text: `Para restablecer tu contraseña usa este enlace: ${url}`,
    });

    if (error) {
      this.logger.error(`Resend reset error: ${error.message}`);
      throw error;
    }
  }

  private templateVerify(nombre: string, url: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
        <h2 style="margin:0 0 8px">Hola, ${nombre}</h2>
        <p style="margin:0 0 16px">Confirma tu correo para activar tu cuenta en <strong>CapiTrack</strong>.</p>
        <a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:8px;text-decoration:none;background:#0ea5e9;color:#fff;font-weight:600">Verificar correo</a>
        <p style="margin:16px 0 0;font-size:12px;color:#666">Si no funciona el botón, copia y pega este enlace:<br>${url}</p>
      </div>`;
  }

  private templateReset(nombre: string, url: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
        <h2 style="margin:0 0 8px">Hola, ${nombre}</h2>
        <p style="margin:0 0 16px">Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:8px;text-decoration:none;background:#22c55e;color:#fff;font-weight:600">Restablecer contraseña</a>
        <p style="margin:16px 0 0;font-size:12px;color:#666">Si tú no solicitaste el cambio, ignora este mensaje.</p>
        <p style="margin:8px 0 0;font-size:12px;color:#666">Enlace directo: ${url}</p>
      </div>`;
  }
}
