import { Module } from '@nestjs/common';
import { JornadasService } from './jornada.service';
import { JornadasController } from './jornada.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [JornadasController],
  providers: [JornadasService]
})
export class JornadasModule {}

