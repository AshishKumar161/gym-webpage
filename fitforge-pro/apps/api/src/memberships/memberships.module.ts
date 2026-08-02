import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { EmailService } from '../services/email.service';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [MembershipsController],
  providers: [MembershipsService, EmailService, CloudinaryService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
