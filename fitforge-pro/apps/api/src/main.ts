import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // ─── Security Middleware ──────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
    }),
  );

  app.use(cookieParser());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [frontendUrl, /\.fitforgepro\.in$/],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // ─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,           // Auto-transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
    }),
  );

  // ─── Global Filters ───────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Interceptors ──────────────────────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Swagger Documentation ────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('FitForge Pro API')
      .setDescription(
        'Enterprise Gym Management Platform REST API\n\nAuthentication: JWT Bearer Token or HTTP-Only Cookies',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'JWT',
      )
      .addCookieAuth('accessToken')
      .addTag('Auth', 'Authentication & Authorization')
      .addTag('Users', 'User management')
      .addTag('Memberships', 'Membership plans & subscriptions')
      .addTag('Payments', 'Payment processing')
      .addTag('Attendance', 'QR check-in & attendance')
      .addTag('Trainers', 'Trainer profiles & bookings')
      .addTag('Workouts', 'Workout plans & exercise history')
      .addTag('Diet', 'Diet plans & nutrition')
      .addTag('Classes', 'Group class schedules')
      .addTag('Gallery', 'Image gallery management')
      .addTag('Blog', 'Blog & content management')
      .addTag('Reviews', 'Member reviews & testimonials')
      .addTag('Notifications', 'Push & email notifications')
      .addTag('Contact', 'Contact form & inquiries')
      .addTag('Coupons', 'Discount coupons')
      .addTag('Dashboard', 'Analytics & reporting')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }

  // ─── Graceful Shutdown ────────────────────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`🚀 FitForge Pro API running on port ${port} [${nodeEnv}]`);
  logger.log(`📡 API base URL: http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
