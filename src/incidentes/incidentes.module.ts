import { Module } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { IncidentesController } from './incidentes.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module'; // ✅ Importar FirebaseModule

@Module({
  imports: [
    PrismaModule,
    FirebaseModule, // ✅ Agregado aquí
  ],
  controllers: [IncidentesController],
  providers: [IncidentesService],
})
export class IncidentesModule {}


