import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { UnidadesModule } from './unidades/unidades.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { CombustibleModule } from './combustible/combustible.module';
import { ServiciosModule } from './servicios/servicios.module';
import { JornadasModule } from './jornada/jornada.module';
import { IncidentesModule } from './incidentes/incidentes.module';
import { GpsModule } from './gps/gps.module';
import { ReportesModule } from './reporte/reporte.module';
import { GeocercasModule } from './geocercas/geocercas.module';
import { AlertasModule } from './alertas/alertas.module';
import { NotificationsModule } from './notifications/notifications.module'; 

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    UnidadesModule,
    ProveedoresModule,
    CombustibleModule,
    ServiciosModule,
    JornadasModule,
    IncidentesModule,
    GpsModule,
    ReportesModule,
    GeocercasModule,
    AlertasModule,
    NotificationsModule, // ✅ Y aquí también
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
