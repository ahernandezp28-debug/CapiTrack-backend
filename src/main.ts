// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';

function getLanIp(): string {
  const ifaces = os.networkInterfaces();

  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (!iface || iface.family !== 'IPv4' || iface.internal) continue;

      const ip = iface.address;

      // ❌ saltamos IPs que NO queremos usar para Expo:
      if (
        ip.startsWith('169.254.') || // APIPA
        ip.startsWith('0.') ||
        ip.startsWith('127.') ||
        ip.startsWith('192.168.56.') // VirtualBox Host-Only
      ) {
        continue;
      }

      return ip;
    }
  }

  return 'localhost';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expoIp = process.env.EXPO_IP || getLanIp();
  const PORT = Number(process.env.PORT ?? 3000);
  const BIND_HOST = '0.0.0.0';

  // 🛡️ CORS sencillo y abierto para DEV
  app.enableCors({
    origin: true,        // acepta cualquier origin
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

  // ✅ Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 🩺 Endpoint simple para verificar conexión desde Expo
  app.getHttpAdapter().get('/health', (_req, res) => {
    res.send({ ok: true, msg: '✅ CapiTrack Backend funcionando' });
  });

  // 🗃️ Prisma (seed mínimo)
  const prisma = app.get(PrismaService);
  try {
    const existing = await prisma.rol.findUnique({
      where: { nombre: 'Administrador' },
    });
    if (!existing) {
      await prisma.rol.create({ data: { nombre: 'Administrador' } });
      console.log('Rol "Administrador" creado ✅');
    } else {
      console.log('Rol "Administrador" ya existe ✔️');
    }
  } catch (e) {
    console.error('Error inicializando Prisma/seed de rol:', e);
  }

  await app.listen(PORT, BIND_HOST);

  console.log('\n✅ Backend escuchando en TODAS las interfaces (0.0.0.0)');
  console.log(`📡 Usa esta IP para probar desde la red:  http://${expoIp}:${PORT}`);
  console.log('💡 Prueba desde tu navegador o cel:');
  console.log(`   http://${expoIp}:${PORT}/health`);
}

bootstrap();
