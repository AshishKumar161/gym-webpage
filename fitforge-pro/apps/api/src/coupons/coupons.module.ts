import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [CouponsController],
  providers: [CouponsService, EmailService, CloudinaryService],
  exports: [CouponsService],
})
export class CouponsModule {}
