// src/unidades/unidades.module.ts
import { Module } from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseModule } from '../firebase/firebase.module'; // ✅ importamos FirebaseModule

@Module({
  imports: [FirebaseModule], // ✅ lo añadimos aquí
  controllers: [UnidadesController],
  providers: [UnidadesService, PrismaService],
})
export class UnidadesModule {}
