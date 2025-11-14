import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { EmailModule } from '../notifications/email.module';
import { PrismaService } from '../../prisma/prisma.service';         // 👈 ajusté la ruta
import { FirebaseAuthGuard } from './firebase-auth.guard';        // 👈 IMPORTANTE

@Module({
  imports: [FirebaseModule, EmailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseAdminService,
    PrismaService,
    FirebaseAuthGuard,                                           // 👈 REGISTRAR GUARD
  ],
  exports: [
    FirebaseAuthGuard,                                           // 👈 EXPORTARLO
    PrismaService,
    FirebaseAdminService,
  ],
})
export class AuthModule {}
