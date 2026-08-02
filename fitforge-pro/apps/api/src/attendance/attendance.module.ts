import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, EmailService, CloudinaryService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
