import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [ContactController],
  providers: [ContactService, EmailService, CloudinaryService],
  exports: [ContactService],
})
export class ContactModule {}
