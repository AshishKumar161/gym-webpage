import { Module } from '@nestjs/common';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [TrainersController],
  providers: [TrainersService, EmailService, CloudinaryService],
  exports: [TrainersService],
})
export class TrainersModule {}
