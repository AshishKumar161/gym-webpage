import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [GalleryController],
  providers: [GalleryService, EmailService, CloudinaryService],
  exports: [GalleryService],
})
export class GalleryModule {}
