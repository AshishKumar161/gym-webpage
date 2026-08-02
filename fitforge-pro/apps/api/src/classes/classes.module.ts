import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, EmailService, CloudinaryService],
  exports: [ClassesService],
})
export class ClassesModule {}
