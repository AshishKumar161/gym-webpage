import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, EmailService, CloudinaryService],
  exports: [DashboardService],
})
export class DashboardModule {}
