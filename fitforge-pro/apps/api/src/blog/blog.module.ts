import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService, EmailService, CloudinaryService],
  exports: [BlogService],
})
export class BlogModule {}
