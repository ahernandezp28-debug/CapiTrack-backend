import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { UnidadesModule } from './unidades/unidades.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { CombustibleModule } from './combustible/combustible.module';

@Module({
  imports: [PrismaModule, UsuariosModule, UnidadesModule, ProveedoresModule, CombustibleModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
