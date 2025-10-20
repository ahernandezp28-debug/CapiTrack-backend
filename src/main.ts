import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/prisma.service';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // ---------- CREAR ROL DE PRUEBA ----------
  const prisma = app.get(PrismaService);

  // Verificar si ya existe un rol con ese nombre
  const existing = await prisma.rol.findUnique({
    where: { nombre: 'Administrador' },
  });

  if (!existing) {
    await prisma.rol.create({
      data: { nombre: 'Administrador' },
    });
    console.log('Rol "Administrador" creado correctamente ✅');
  } else {
    console.log('Rol "Administrador" ya existe ✔️');
  }
  // -----------------------------------------

  const port = 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();

