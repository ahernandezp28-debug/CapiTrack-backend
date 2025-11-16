import { Module } from '@nestjs/common';
import { JornadaService } from './jornada.service';
import { JornadaController } from './jornada.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [JornadaController],
  providers: [JornadaService]
})
export class JornadasModule {}

