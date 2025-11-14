import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'] as string | undefined;
    const token =
      (authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : undefined) ||
      (req.headers['x-firebase-token'] as string | undefined);

    if (!token) {
      throw new UnauthorizedException('Falta token de autorización');
    }

    try {
      const decoded = await this.firebaseAdmin.verifyIdToken(token);

      // 🔐 Usuario del token
      req.user = decoded;

      // 👤 Usuario de la BD (por correo)
      if (decoded.email) {
        const dbUser = await this.prisma.usuario.findUnique({
          where: { correo: decoded.email },
        });

        req.dbUser = dbUser ?? null;
      } else {
        req.dbUser = null;
      }

      return true;
    } catch (e: any) {
      throw new UnauthorizedException(
        `Token inválido o usuario no autorizado: ${e?.message ?? ''}`,
      );
    }
  }
}
