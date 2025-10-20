import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { FirebaseSyncService } from './firebase-sync.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly firebaseSyncService: FirebaseSyncService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verificar token en Firebase
      const decodedToken = await this.firebaseAdmin.getAuth().verifyIdToken(token);
      request.user = decodedToken; // ✅ guardar usuario Firebase

      // Sincronizar usuario con la base de datos
      const usuario = await this.firebaseSyncService.syncUserFromFirebase(decodedToken.uid);

      request.dbUser = usuario; // ✅ guardar usuario PostgreSQL

      return true;
    } catch (error) {
      console.error('Error de autenticación Firebase:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}

