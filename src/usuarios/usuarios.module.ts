// src/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseSyncService } from '../auth/firebase-sync.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Module({
  imports: [FirebaseModule],
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    PrismaService,
    FirebaseSyncService,
    FirebaseAuthGuard,
  ],
  exports: [UsuariosService],
})
export class UsuariosModule {}


