import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, EmailService, CloudinaryService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
