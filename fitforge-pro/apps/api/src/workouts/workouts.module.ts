import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [WorkoutsController],
  providers: [WorkoutsService, EmailService, CloudinaryService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
