import { Module } from '@nestjs/common';
import { IncidenteService } from './incidentes.service';
import { IncidenteController } from './incidentes.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module'; // ✅ Importar FirebaseModule

@Module({
  imports: [
    PrismaModule,
    FirebaseModule, // ✅ Agregado aquí
  ],
  controllers: [IncidenteController],
  providers: [IncidenteService],
})
export class IncidentesModule {}


