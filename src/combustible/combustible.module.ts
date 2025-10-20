import { Module } from '@nestjs/common';
import { CombustibleService } from './combustible.service';
import { CombustibleController } from './combustible.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // 🔹 Importa el módulo de Prisma
import { FirebaseModule } from '../firebase/firebase.module'; // 🔹 Para el guard y sincronización

@Module({
  imports: [PrismaModule, FirebaseModule], // ✅ Importamos Prisma y Firebase
  controllers: [CombustibleController],
  providers: [CombustibleService],
})
export class CombustibleModule {}
