import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, CloudinaryService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
