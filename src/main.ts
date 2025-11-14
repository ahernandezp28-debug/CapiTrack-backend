// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';
// import helmet from 'helmet'; // 🔒 activa en producción

function getLanIp(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (
        iface &&
        iface.family === 'IPv4' &&
        !iface.internal &&
        !iface.address.startsWith('169.254.') &&
        !iface.address.startsWith('0.')
      ) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ CORS completamente abierto para Expo (Web, LAN y móvil)
  const hostIp = process.env.HOST || getLanIp();

  app.enableCors({
    origin: [
      'http://localhost:8081', // Expo Web dev
      'http://localhost:19006', // Expo Web alt
      `http://${hostIp}:19006`, // Expo LAN
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // 🧱 Middleware extra — garantiza que el preflight reciba los headers CORS
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    const allowList = new Set([
      'http://localhost:8081',
      'http://localhost:19006',
      `http://${hostIp}:19006`,
    ]);
    if (origin && allowList.has(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // app.use(helmet()); // activa en producción

  // ✅ Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
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
    const existing = await prisma.rol.findUnique({ where: { nombre: 'Administrador' } });
    if (!existing) {
      await prisma.rol.create({ data: { nombre: 'Administrador' } });
      console.log('Rol "Administrador" creado ✅');
    } else {
      console.log('Rol "Administrador" ya existe ✔️');
    }
  } catch (e) {
    console.error('Error inicializando Prisma/seed de rol:', e);
  }

  // 🚀 Host/Port
  const PORT = Number(process.env.PORT ?? 3000);
  const HOST = process.env.HOST ?? hostIp;

  await app.listen(PORT, HOST);

  console.log(`\n✅ Backend corriendo en:  http://${HOST}:${PORT}`);
  console.log('💡 Prueba desde tu navegador o cel:');
  console.log(`   http://${HOST}:${PORT}/health`);
  console.log('\n🌐 Expo Web:');
  console.log('   - http://localhost:19006  (PC)');
  console.log(`   - http://${HOST}:19006  (LAN)`);
  console.log('\n📱 En app Expo (dispositivo), usa la IP LAN para la baseURL del backend.\n');
}

bootstrap();
