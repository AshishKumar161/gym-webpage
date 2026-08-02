import { Module } from '@nestjs/common';
import { DietController } from './diet.controller';
import { DietService } from './diet.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [DietController],
  providers: [DietService, EmailService, CloudinaryService],
  exports: [DietService],
})
export class DietModule {}
