import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, EmailService, CloudinaryService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
