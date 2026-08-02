import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PaymentsModule } from './payments/payments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TrainersModule } from './trainers/trainers.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { DietModule } from './diet/diet.module';
import { GalleryModule } from './gallery/gallery.module';
import { BlogModule } from './blog/blog.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ContactModule } from './contact/contact.module';
import { CouponsModule } from './coupons/coupons.module';
import { ClassesModule } from './classes/classes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmailService } from './services/email.service';
import { CloudinaryService } from './services/cloudinary.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),

    // Task Scheduling
    ScheduleModule.forRoot(),

    // Core
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    MembershipsModule,
    PaymentsModule,
    AttendanceModule,
    TrainersModule,
    WorkoutsModule,
    DietModule,
    GalleryModule,
    BlogModule,
    ReviewsModule,
    NotificationsModule,
    ContactModule,
    CouponsModule,
    ClassesModule,
    DashboardModule,
  ],
  providers: [EmailService, CloudinaryService],
})
export class AppModule {}
