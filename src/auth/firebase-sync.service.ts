// src/auth/firebase-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseSyncService {
  private readonly logger = new Logger(FirebaseSyncService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Sincroniza el usuario de Firebase con la base de datos local (PostgreSQL)
   * Crea o actualiza el usuario según su correo electrónico o UID
   */
  async syncUserFromFirebase(uid: string) {
    try {
      const userRecord = await admin.auth().getUser(uid);

      // Aseguramos que el correo siempre sea un string
      const email = userRecord.email ?? `${userRecord.uid}@firebase.local`;
      const nombre = userRecord.displayName ?? 'Usuario Firebase';

      // Upsert: si el usuario existe, lo actualiza; si no, lo crea
      const usuario = await this.prisma.usuario.upsert({
        where: { correo: email },
        update: {
          nombre,
        },
        create: {
          nombre,
          correo: email,
          password: 'firebase', 
          rol_id: 1, 
        },
      });

      this.logger.log(`Usuario sincronizado: ${usuario.nombre}`);
      return usuario;
    } catch (error) {
      this.logger.error('Error al sincronizar usuario desde Firebase', error);
      throw error;
    }
  }
}
