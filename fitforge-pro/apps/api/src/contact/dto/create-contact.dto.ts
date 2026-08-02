import { IsString, IsEmail, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum InquiryType {
  MEMBERSHIP = 'membership',
  TRAINING = 'training',
  DIET = 'diet',
  CORPORATE = 'corporate',
  OTHER = 'other',
}

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' })
  phone: string;

  @ApiProperty({ example: 'Interested in Pro membership' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'I would like to know more about...' })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  message: string;

  @ApiProperty({ enum: InquiryType, example: InquiryType.MEMBERSHIP })
  @IsEnum(InquiryType)
  inquiryType: InquiryType;
}
